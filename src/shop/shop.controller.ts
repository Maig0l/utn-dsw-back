import {Request, Response, NextFunction, response} from 'express'
import { ShopRepository } from './shop.repository.js'
import { paramCheckFromList } from '../shared/paramCheckFromList.js';

// Registrar parámetros válidos para un post/put/patch
const VALID_PARAMS = "name img site".split(' ')
const hasParams = paramCheckFromList(VALID_PARAMS)

const repository = new ShopRepository();

function findAll(req: Request, res: Response) {
  res.json( {data: repository.findAll()} )
}

function findOne(req: Request, res: Response) {
  const shop = repository.findOne( {id: res.locals.id} )
  if (!shop)
    return res.status(500).json({message: "FindOne failed!"})
  res.json({data: shop})
}

function add(req: Request, res: Response) {
  const shop = repository.add(res.locals.sanitizedInput)
  if (!shop)
    return res.status(500).json({message: "Add failed!"})
  res.status(201).json({data: shop})
}

function update(req: Request, res: Response) {
  // El método Repository.Update toma un objeto que contiene el ID para buscar
  //  JUNTO con los datos a reemplazar
  const newData = {...res.locals.sanitizedInput, id: res.locals.id}

  const shop = repository.update(newData)
  if (!shop)
    return res.status(500).json({message: "Update failed!"})
  res.json({data: shop})
}

function remove(req: Request, res: Response) {
  const shop = repository.remove({id: res.locals.id})
  if (!shop)
    return res.status(500).json({message: "Remove failed!"})
  res.json({data: shop})
}

/**
 * MiddleWarez!
 */

/**
 * Todas las funciones que deban trabajar con input sanitizado,
 * que trabajen con los valores guardados en res.locals!
 * TODO: (Code Convention para el equipo)
 */
function sanitizeInput(req:Request, res:Response, next:NextFunction) {
  if (["POST", "PUT"].includes(req.method) && !hasParams(req, true))
    return res.status(400)
      .json({message: "Must provide all attributes"})

  if ("PATCH" == req.method && !hasParams(req, false))
    return res.status(400)
      .json({message: "Must provide at least one valid attribute"})

  res.locals.sanitizedInput = {
    name: req.body.name,
    img: req.body.img,
    site: req.body.site
  }
  
  // Robado de SO, como para que sanitize algo (?
  // https://stackoverflow.com/a/3809435
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  if (!urlRegex.test(req.body.site))
    res.locals.sanitizedInput.site = undefined

  // CONSULTA: La sanitización debería ser silenciosa¿
  Object.keys(res.locals.sanitizedInput).forEach((k) => {
    if (res.locals.sanitizedInput[k] === undefined) {
      delete res.locals.sanitizedInput[k]
    }
  })

  next()
}

/**
 * Se supone que sea pasado al router antes de las funciones que buscan por ID
 * Se asegura de que el ID existe, o devuelve el mismo 404/400
 */
function validateExists(req:Request, res:Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id)

  if (Number.isNaN(id))
    return res.status(400).json({message: 'ID must be an integer'})

  const shop = repository.findOne({id})

  if (!shop)
    return res.status(404).json({message: `Shop ${id} not found`})

  res.locals.id = id
  res.locals.shop = shop

  next()
}

export {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  validateExists,
};