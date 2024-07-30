import { Request, Response, NextFunction } from "express";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";
import sanitizeHtml from 'sanitize-html'
import { orm } from "../shared/db/orm.js";
import { User } from "./user.entity.js";
import { userRegistrationSchema, userLoginSchema } from "./user.schema.js";
import { parse as vbParse, safeParse as vbSafeParse } from 'valibot'
import bcrypt from 'bcrypt';
import { randomBytes } from "crypto";

const PASSWD_SALT_ROUNDS = 10

// Mensajes de error
const ERR_500 = "Something went horribly wrong. Oops (this is our fault)"
const ERR_PARAMS_CREATE = 'Must provide all attributes for creation for creation'
const ERR_PARAMS_PATCH = 'Must provide at least one valid attribute to update'
const ERR_PARAMS_MODIFY_PUT = 'Must update all attributes'
const ERR_USED_NICK = 'Nickname already in use'
const ERR_USED_EMAIL = 'Email address already in use'

const REQ_PARAMS = "nick email password".split(' ')
const VALID_PARAMS = "nick email password profilePic bio".split(' ')
const hasCreationParams = paramCheckFromList(REQ_PARAMS)
const hasAnyParams = paramCheckFromList(VALID_PARAMS)

const em = orm.em

// *** CRUD ***

// CONSULTA: Estoy empezando a pensar que no es muy buena idea devolver _todos_
//            los datos de un objeto User así a cualquiera

async function findAll(req: Request, res: Response) {
  try {
    const users = await em.find(User, {})
    res.json({data: users})
  } catch (e) {
    handleOrmError(res, e)
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const user = await em.findOneOrFail(User, {id: res.locals.id})
    res.json({data: user})
  } catch (e) {
    handleOrmError(res, e)
  }
}

// *** A.K.A: Register ***
async function add(req: Request, res: Response) {
  if (!hasCreationParams(req.body, true))
    return res.status(400).json({message: ERR_PARAMS_CREATE})

  let newUserData;
  try {
    newUserData = vbParse(userRegistrationSchema, req.body)
  } catch(e) {
    console.log(e)
    return res.status(400).json({message: "Bad data format.", data: e})
  }

  // await returnIfIdentifierIsUsed(res, {email: newUserData.email, nick: newUserData.nick})
  newUserData.password = hashPassword(newUserData.password)

  try {
    const user = await em.create(User, newUserData)
    await em.flush()

    res.status(201).json({message: "User created successfully", data: user})
  } catch (e) {
    handleOrmError(res, e)
  }
}

async function update(req: Request, res: Response) {
  // TODO: Tal vez pedir también la contraseña para cambiar atributos como el email o passwd
  if (req.method === "PATCH" && !hasAnyParams(req.body, false))
    return res.status(400).json({message: ERR_PARAMS_PATCH})

  if (req.method === "PUT" && !hasCreationParams(req.body, true))
    return res.status(400).json({message: ERR_PARAMS_MODIFY_PUT})

  try {
    // TODO: Qué pasa si en el input viene para cambiar el id?
    // Debería sacarlo la sanitización?

    const user = await em.findOneOrFail(User, {id: res.locals.id})
    em.assign(user, res.locals.sanitizedInput)
    await em.flush()

    res.json({message: "User updated", data: user})
  } catch (e) {
    handleOrmError(res, e)
  }
}

async function remove(req: Request, res: Response) {
  try {
    const user = await em.findOneOrFail(User, {id: res.locals.id})
    await em.removeAndFlush(user)
    res.json({message: "User deleted successfully", data: user})
  } catch (e) {
    handleOrmError(res, e)
  }
}

async function login(req: Request, res: Response) {
  const ERR_LOGIN_BAD_CREDS = "Invalid user/pass"

  let inputParse = vbSafeParse(userLoginSchema, res.locals.sanitizedInput)
  if (!inputParse.success)
    return res.status(400).json({message: ERR_LOGIN_BAD_CREDS})
  const saneInput = inputParse.output

  // Uso findOne y no findOneOrFail para devolver el error LOGIN_BAD_CREDS, no un ERR_404 del handleOrmError
  let user;
  try {
    user = await em.findOne(User, {nick: saneInput.nick})
  } catch(e) {
    throw500(res, e)
  }
  if (!user)
    return res.status(400).json({message: ERR_LOGIN_BAD_CREDS})

  const passwdIsCorrect = await bcrypt.compare(saneInput.password, user.password)
  if (!passwdIsCorrect)
    return res.status(400).json({message: ERR_LOGIN_BAD_CREDS})

  // TODO: Reemplazar con una función de verdad que genere un token de auth
  res.json({message: "Login successful", data: {sessionToken: randomBytes(20).toString('hex')}})
}

/* *** Helper functions ***
*/

function hashPassword(passwd: string): string {
  return bcrypt.hashSync(passwd, PASSWD_SALT_ROUNDS)
}

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case "ER_DUP_ENTRY":
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        // TODO: Devolver un error dinámico que indique que el email o nick ya está usado, no cualquier atributo
        res.status(400).json({message: `A user with those attributes already exists.`})
        break
      case "ER_DATA_TOO_LONG":
        res.status(400).json({message: `Data too long.`})
        break
    }
  }
  else {
    switch (err.name) {
      case "NotFoundError":
        res.status(404).json({message: `User not found for ID ${res.locals.id}`})
        break
      default:
        console.error("\n--- ORM ERROR ---")
        console.error(err.message)
        res.status(500).json({message: "Oops! Something went wrong. This is our fault."})
        break
    }
  }
}

function throw500(res: Response, err: any) {
  res.status(500).json({message: ERR_500})
}


/* *** Middlewarez ***
*/

function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id)
  if (Number.isNaN(id))
    return res.status(400).json({message: "ID must be an integer"})

  // const user = repo.findOne({id})
  // if (!user)
  //   return res.status(404).json({message: `User ${req.params.id} not found`})

  res.locals.id = id
  // res.locals.user = user

  next()
}

// Se ejecuta al crear o modificar un registro
async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  res.locals.sanitizedInput = {
    nick: req.body.nick,
    email: req.body.email,
    password: req.body.password,
    profilePic: req.body.profilePic,
    bioText: req.body.bioText,
    likes: req.body.likes,
    linkedAccounts: req.body.linkedAccounts,
    createdPlaylists: req.body.createdPlaylists,
    reviews: req.body.reviews,
  }
  const sanIn = res.locals.sanitizedInput

  // Se borran todos los códigos HTML que el usuario ingrese, dejándo sólo los
  //   válidos para formatear un poco la bio
  // TODO: El frontend debe admitir un editor de bbText o MD y transformar los
  //   *, **, []() a HTML válido
  if (sanIn.bio)
    sanIn.bioText = sanitizeHtml(sanIn.bioText, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a'],
      allowedAttributes: {
        'a': ['href']
      }
    })
  
  Object.keys(res.locals.sanitizedInput).forEach((k) => {
    if (res.locals.sanitizedInput[k] === undefined)
      delete res.locals.sanitizedInput[k]
  })

  next()
}

export {findAll, findOne, add, update, remove, validateExists, sanitizeInput, login }