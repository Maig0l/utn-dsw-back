import { Request, Response, NextFunction } from "express";
import { UserRepository } from "./user.repository.js";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";
import sanitizeHtml from 'sanitize-html'

const ERR_500 = "Something went horribly wrong. Oops (this is our fault)"

const REQ_PARAMS = "nick email password".split(' ')
const VALID_PARAMS = "nick email password profilePic bio".split(' ')
const hasCreationParams = paramCheckFromList(REQ_PARAMS)
const hasAnyParams = paramCheckFromList(VALID_PARAMS)

const repo = new UserRepository()

function findAll(req: Request, res: Response) {
  res.json({data: repo.findAll()})
}

function findOne(req: Request, res: Response) {
  // El middleware validateExists ya llama al repo y devuelve el 404
  return res.json({data: res.locals.user})
}

function add(req: Request, res: Response) {
  const user = repo.add(res.locals.sanitizedInput)
  if (!user)
    return res.status(500).json({message: ERR_500})

  res.status(201).json({data: user})
}

function update(req: Request, res: Response) {
  const user = repo.update({...res.locals.sanitizedInput, id: res.locals.id})
  if (!user)
    return res.status(500).json({message: ERR_500})

  res.status(200).json({data: user})
}

function remove(req: Request, res: Response) {
  const user = repo.remove({id: res.locals.id})
  if (!user)
    return res.status(500).json({message: ERR_500})

  res.json({data: user})
}

/** Middlewarez
*/

function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id)
  if (Number.isNaN(id))
    return res.status(400).json({message: "ID must be an integer"})

  const user = repo.findOne({id})
  if (!user)
    return res.status(404).json({message: `User ${req.params.id} not found`})

  res.locals.id = id
  res.locals.user = user

  next()
}

function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Mensajes de error
  const ERR_BAD_NICK = 'Invalid username. (It must be between 3-20 alphanumeric characters, _ allowed)'
  const ERR_BAD_EMAIL = 'Invalid email address. Correct format: "user@mail.com"'
  const ERR_BAD_PASS = 'Invalid password. Must have over 7 characters, at least one letter, one number and one special character'
  const ERR_USED_NICK = 'Nickname already in use'
  const ERR_USED_EMAIL = 'Email address already in use'
  const ERR_PARAMS_CREATE = 'Must provide all attributes for creation (nick, email, password)' // CONSULTA: Sería mejor NO decir los atributos? (ataque)
  const ERR_PARAMS_PATCH = 'Must provide at least one valid attribute to update'
  const ERR_PARAMS_MODIFY_PUT = 'Must update all attributes'

  if (req.method === "POST" && !hasCreationParams(req.body, true))
    return res.status(500).json({message: ERR_PARAMS_CREATE})

  if (req.method === "PATCH" && !hasAnyParams(req.body, false))
    return res.status(500).json({message: ERR_PARAMS_PATCH})

  if (req.method === "PUT" && !hasCreationParams(req.body, true))
    return res.status(500).json({message: ERR_PARAMS_MODIFY_PUT})

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
   * Caract. permitidos: a-z A-Z 0-9 _
   * Longitud: 3 <= L <= 20
   */
  if (sanIn.nick) {
    const nicknameRegex = /^\w{3,20}$/
    if (!nicknameRegex.test(sanIn.nick))
      return res.status(400).json({message: ERR_BAD_NICK})
    if (repo.findByNick(sanIn.nick) !== undefined)
      return res.status(400).json({message: ERR_USED_NICK})
  }

  if (sanIn.email) {
    const emailRegex = /^[\w+.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
    if (!emailRegex.test(sanIn.email))
      return res.status(400).json({message: ERR_BAD_EMAIL})
    // No puede haber dos usuarios con el mismo email
    if (repo.findByEmail(sanIn.email) !== undefined)
      return res.status(400).json({message: ERR_USED_EMAIL})
  }

  /** Requisitos de la contraseña:
   * Longitud >= 8
   * Caracteres obligatorios: 1x letra, 1x número, 1x caractér especial
   * RegEx tomado de: https://stackoverflow.com/a/21456918
   */
  if (sanIn.password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d @$!%*#?&]{8,}$/
    if (!passwordRegex.test(sanIn.password))
      return res.status(400).json({message: ERR_BAD_PASS})
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

export {findAll, findOne, add, update, remove, validateExists, sanitizeInput}