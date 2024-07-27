import { Request, Response, NextFunction } from "express";
import { UserRepository } from "./user.repository.js";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";
import sanitizeHtml from 'sanitize-html'
import { orm } from "../shared/db/orm.js";
import { User } from "./user.entity.js";
import bcrypt from 'bcrypt';
import { randomBytes } from "crypto";

const PASSWD_SALT_ROUNDS = 10

const ERR_500 = "Something went horribly wrong. Oops (this is our fault)"

const REQ_PARAMS = "nick email password".split(' ')
const VALID_PARAMS = "nick email password profilePic bio".split(' ')
const hasCreationParams = paramCheckFromList(REQ_PARAMS)
const hasAnyParams = paramCheckFromList(VALID_PARAMS)

const em = orm.em

// *** CRUD ***

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
  try {
    // TODO: Validate
    const user = await em.create(User, res.locals.sanitizedInput)
    if (!user) //why tho
      throw new Error(ERR_500)
    await em.flush()
    res.status(201).json({message: "User created successfully", data: user})
  } catch (e) {
    handleOrmError(res, e)
  }
}

async function update(req: Request, res: Response) {
  try {
    // TODO: Qué pasa si en el input viene para cambiar el id?
    // Debería sacarlo la sanitización

    const user = await em.findOneOrFail(User, {id: res.locals.id})
    em.assign(user, res.locals.sanitizedInput)
    await em.flush()
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

/** Login 
 * {
 *  user
 *  passwd
 * }
 */
async function login(req: Request, res: Response) {
  const ERR_LOGIN_BAD_CREDS = "Invalid user/pass"

  let user;
  try {
    user = await em.findOne(User, {nick: req.body.nick})
  } catch(e) {
    handleOrmError(res, e)
  }
  if (!user)
    return res.status(400).json({message: ERR_LOGIN_BAD_CREDS})

  const passwdIsCorrect = await bcrypt.compare(res.locals.sanitizedInput.password, user.password)
  if (!passwdIsCorrect)
    return res.status(400).json({message: ERR_LOGIN_BAD_CREDS})

  res.json({message: "Login successful", data: {sessionToken: randomBytes(20).toString('hex')}})
}

/* *** Helper functions ***
*/

function sanitizeLoginForm(req: Request, res: Response, next: NextFunction) {
  res.locals.sanitizedInput = {
    nick: req.body.nick,
    password: req.body.password
  }
  const sanIn = res.locals.sanitizedInput
  if (!sanIn.nick || !sanIn.password)
    return res.status(400).json({message: "Fields required"})
  next()
}

function hashPassword(passwd: string): string {
  return bcrypt.hashSync(passwd, PASSWD_SALT_ROUNDS)
}

async function checkPassword(passwd: string): Promise<boolean> {
  // TODO: write
  return true
}

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case "ER_DUP_ENTRY":
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        // TODO: no debería ocurrir
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

/** CONSLUTA: Los middlewares para sanitizar input, y para validar
 *             el formato de los inputs (ej: user, password) deberían estar separados?
 *             ahora mismo están ambas cosas en el mismo sanitizeInput()
 */

/** ANS: Zod, valibot, classValidator para validar user, passwd */

// Se ejecuta al crear o modificar un registro
async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Mensajes de error
  const ERR_BAD_NICK = 'Invalid username. (It must be between 3-20 alphanumeric characters, _ allowed)'
  const ERR_BAD_EMAIL = 'Invalid email address. Correct format: "user@mail.com"'
  const ERR_BAD_PASS = 'Invalid password. Must have 8-50 characters, at least one letter, one number and one special character'
  const ERR_USED_NICK = 'Nickname already in use'
  const ERR_USED_EMAIL = 'Email address already in use'
  const ERR_PARAMS_CREATE = 'Must provide all attributes for creation (nick, email, password)' // CONSULTA: Sería mejor NO decir los atributos? (ataque)
  const ERR_PARAMS_PATCH = 'Must provide at least one valid attribute to update'
  const ERR_PARAMS_MODIFY_PUT = 'Must update all attributes'

  if (req.method === "POST" && !hasCreationParams(req.body, true))
    return res.status(400).json({message: ERR_PARAMS_CREATE})

  if (req.method === "PATCH" && !hasAnyParams(req.body, false))
    return res.status(400).json({message: ERR_PARAMS_PATCH})

  if (req.method === "PUT" && !hasCreationParams(req.body, true))
    return res.status(400).json({message: ERR_PARAMS_MODIFY_PUT})

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

  /** Requisitos del nickname:
   * No debe haber un usuario con el mismo nick
   * Caract. permitidos: a-z A-Z 0-9 _ .
   * No se permite empezar ni terminar el nick con (.)
   * No se admiten nicks con dos o más (.) consecutivos
   * Longitud: 3 <= L <= 30
   */
  if (sanIn.nick) {
    const nicknameRegex = /^(?!(^\.|.*\.$))(?!.*\.{2,}.*)[\w\.]{3,30}$/
    if (!nicknameRegex.test(sanIn.nick))
      return res.status(400).json({message: ERR_BAD_NICK})

    // CONSULTA: Se puede evitar la consulta a la base de datos?
    // TODO: Esto es VALIDACIÓN PARA EL REGISTRO, no sanitización... *** delete this ***
    if (await em.findOne(User, {nick: sanIn.nick}) != null)
      return res.status(400).json({message: ERR_USED_NICK})
  }

  if (sanIn.email) {
    const emailRegex = /^[\w+.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
    if (!emailRegex.test(sanIn.email))
      return res.status(400).json({message: ERR_BAD_EMAIL})
    // No puede haber dos usuarios con el mismo email
    // CONSULTA: Esta comprobación ya la hace la DB (Users.email es Unique) y tira su error
    //            debería dejar que handleOrmError() se encargue de avisar esto?
    if (await em.findOne(User, {email: sanIn.email}) !== null)
      return res.status(400).json({message: ERR_USED_EMAIL})
  }

  /** Requisitos de la contraseña:
   * Longitud: 8 >= L >= 128
   * Caracteres obligatorios: 1x letra, 1x número, 1x caractér especial
   * RegEx tomado de: https://stackoverflow.com/a/21456918
   * TODO: El espacio no está siendo tomado como caracter especial
   */
  if (sanIn.password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d @$!%*#?&]{8,128}$/
    if (!passwordRegex.test(sanIn.password))
      return res.status(400).json({message: ERR_BAD_PASS})

    // CONSULTA[ans]: Conviene hashear la passwd en el midware de sanitización? O debería ser otro middleware?
    //            Probablemente iría en la función de validación para registro (?)
    //            o directamente en las funciones de /login y /register ? ANS: <-- THIS
    sanIn.password = hashPassword(sanIn.password)
  }
  
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

export {findAll, findOne, add, update, remove, validateExists, sanitizeInput, login, sanitizeLoginForm}