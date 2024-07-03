import { Request, Response, NextFunction } from "express";
import { UserRepository } from "./user.repository.js";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";
import sanitizeHtml from 'sanitize-html'

const REQ_PARAMS = "nick email password".split(' ')
const VALID_PARAMS = "nick email password profilePic bio".split(' ')
const hasParams = paramCheckFromList(VALID_PARAMS)

const repo = new UserRepository()

function findAll(req: Request, res: Response) {
  res.json({data: repo.findAll()})
}

function findOne(req: Request, res: Response) {
  // El middleware validateExists ya llama al repo y devuelve el 404
  return res.json({data: res.locals.user})
}

function add(req: Request, res: Response) {
}

function update(req: Request, res: Response) {
}

function remove(req: Request, res: Response) {
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
  const ERR_BADNICK = "Invalid username. (It must be between 3-20 alphanumeric characters, _ allowed)"
  const ERR_BADEMAIL = 'Invalid email address. Correct format: "user@mail.com"'
  const ERR_PASS_BADFORMAT = 'Invalid password. Must have over 7 characters, at least one letter, one number and one special character'

  // no hay nada mejor, no hay nada mejor
  // que casa.
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
   * TODO: No debe haber un usuario con el mismo nick
   * Caract. permitidos: a-z A-Z 0-9 _
   * Longitud: 3 <= L <= 20
   */
  const nicknameRegex = /^\w{3,20}$/
  if (!nicknameRegex.test(sanIn.nick))
    return res.status(400).json({message: ERR_BADNICK})

  // TODO: No puede haber dos usuarios con el mismo email
  const emailRegex = /^[\w+.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
  if (!emailRegex.test(sanIn.email))
    return res.status(400).json({message: ERR_BADEMAIL})

  /** Requisitos de la contraseña:
   * Longitud >= 8
   * Caracteres obligatorios: 1x letra, 1x número, 1x caractér especial
   * RegEx tomado de: https://stackoverflow.com/a/21456918
   */
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
  if (!passwordRegex.test(sanIn.password))
    return res.status(400).json({message: ERR_PASS_BADFORMAT})
  
  // Se borran todos los códigos HTML que el usuario ingrese, dejándo sólo los
  //   válidos para formatear un poco la bio
  // TODO: El frontend debe admitir un editor de bbText o MD y transformar los
  //   *, **, []() a HTML válido
  sanIn.bioText = sanitizeHtml(sanIn.bioText, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      'a': ['href']
    }
  })

  next()
}

export {findAll, findOne, add, update, remove, validateExists, sanitizeInput}