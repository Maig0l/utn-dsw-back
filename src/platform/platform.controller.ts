import {NextFunction, Request, Response} from 'express'
import { validatePlatform } from './platform.schema.js';
import { Platform } from './platform.entity.js'
import { orm } from '../shared/db/orm.js'

const ERR_500 = "Oops! Something went wrong. This is our fault."

const em = orm.em


async function findAll(req: Request,res: Response) {
  try{
    const platforms = await em.find(Platform, {})
    res.status(200).json({message:'found all platforms', data: platforms})
  } catch(err) {
    handleOrmError(res, err)
  }
   
}


async function findOne(req: Request ,res:Response) {
  try{
    const id = Number.parseInt(res.locals.id)
    const platform = await em.findOneOrFail(Platform, {id})
    res.status(200).json({message:'found platform', data: platform})
  } catch(err) {
    handleOrmError(res, err)
  }
}


async function add(req:Request,res:Response) {
  try{
    const platform = em.create(Platform, req.body)
    await em.flush()
    res.status(201).json({message: 'platform created', data: platform})
  }  catch(err) {
    handleOrmError(res, err)
  }
}


async function update (req:Request,res:Response) {
    try{
    const id = Number.parseInt(res.locals.id)
    const platform = em.getReference(Platform, id)
    em.assign(platform, req.body)
    await em.flush()
    res.status(200).json({message: 'platform updated', data: platform})
  }  catch(err) {
    handleOrmError(res, err)
  }
}


async function remove (req:Request,res:Response) {
  try{
    const id = Number.parseInt(res.locals.id)
    const platform = em.getReference(Platform, id)
    await em.removeAndFlush(platform)
    res.status(200).send({message: 'platform deleted'})
  } catch(err) {
    handleOrmError(res, err)
  }
  }


  function validateExists(req:Request, res:Response, next: NextFunction) {
    const id = Number.parseInt(req.params.id)  
    if (Number.isNaN(id))
      return res.status(400).json({message: 'ID must be an integer'})
   
    res.locals.id = id
  
    next()
  }

async function sanitizeInput(req:Request, res:Response, next:NextFunction) {
  const incoming = await validatePlatform(req.body)
  if (!incoming.success)
    return res.status(400).json({message: incoming.issues[0].message})
  const newPlatform = incoming.output 

  res.locals.newPlatform = newPlatform

  next()
  
  // https://stackoverflow.com/a/3809435
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  if (req.body.site && !urlRegex.test(req.body.site))
    return res.status(400).json({message: "Invalid Site attribute (Should be a URL)"})

  // TODO: Revisar que no haya sanitización silenciosa
  Object.keys(res.locals.sanitizedInput).forEach((k) => {
    if (res.locals.sanitizedInput[k] === undefined) {
      delete res.locals.sanitizedInput[k]
    }
  })

  next()
}


function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case "ER_DUP_ENTRY":
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        res.status(400).json({message: `A shop with that name/site already exists.`})
        break
      case "ER_DATA_TOO_LONG":
        res.status(400).json({message: `Data too long.`})
        break
    }
  }
  else {
    switch (err.name) {
      case "NotFoundError":
        res.status(404).json({message: `Shop not found for ID ${res.locals.id}`})
        break
      default:
        console.error("\n--- ORM ERROR ---")
        console.error(err.message)
        res.status(500).json({message: "Oops! Something went wrong. This is our fault."})
        break
    }
  }
}



export {findAll, findOne, add, update, remove, sanitizeInput, validateExists}