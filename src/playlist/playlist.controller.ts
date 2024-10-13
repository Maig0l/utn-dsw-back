import {NextFunction, Request, Response} from 'express'
import { validatePlaylist } from './playlist.schema.js';
import { Playlist } from './playlist.entity.js'
import { orm } from '../shared/db/orm.js'
import { i } from 'vitest/dist/reporters-yx5ZTtEV.js';

// Mensajes
const ERR_500 = "Oops! Something went wrong. This is our fault."

const em = orm.em

async function findAll(req: Request,res: Response) {
  try{
    const playlists = await em.find(Playlist, {})
    res.status(200).json({message:'found all playlists', data: playlists})
  } catch(err) {
    handleOrmError(res, err)
  }
   
}


async function findOne(req: Request ,res:Response) {
  try{
    const id = Number.parseInt(res.locals.id)
    const playlist = await em.findOneOrFail(Playlist, {id})
    res.status(200).json({message:'found playlist', data: playlist})
  } catch(err) {
    handleOrmError(res, err)
  }
}


async function add(req:Request,res:Response) {
  try{
    const playlist = em.create(Playlist, req.body)
    await em.flush()
    res.status(201).json({message: 'playlist created', data: playlist})
  } catch(err) {
    handleOrmError(res, err)
  }  
}


async function update (req:Request,res:Response) {
    try{
    const id = Number.parseInt(res.locals.id)
    const playlist = em.getReference(Playlist, id)
    em.assign(playlist, req.body)
    await em.flush()
    res.status(200).json({message: 'playlist updated', data: playlist})
  } catch(err) {
    handleOrmError(res, err)
  }   
}


async function remove (req:Request,res:Response) {
  try{
    const id = Number.parseInt(res.locals.id)
    const playlist = em.getReference(Playlist, id)
    await em.removeAndFlush(playlist)
    res.status(200).send({message: 'playlist deleted'})
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
  const incoming = await validatePlaylist(req.body)
  if (!incoming.success)
    return res.status(400).json({message: incoming.issues[0].message})
  const newPlaylist = incoming.output

  res.locals.newPlaylist = newPlaylist

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