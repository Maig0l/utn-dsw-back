import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Review } from "./review.entity.js";

// Mensajes
const ERR_500 = "Oops! Something went wrong. This is our fault."

const em = orm.em

//// *** CRUD *** ////

async function findAll(req: Request, res: Response) {
  try {
    const reviews = await em.find(Review, {})
    res.json({data: reviews})
  } catch(e) {
    handleOrmError(res, e)
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const review = await em.findOneOrFail(Review, {id: res.locals.id})
    res.json({data: review})
  } catch(e) {
    handleOrmError(res, e)
  }
}

async function add(req:Request, res: Response) {
  // TODO: Validar formatos (?)
  try {
    
  } catch(e) {

  }
}

async function remove(req: Request, res: Response) {
  try {
    const review = em.findOneOrFail(Review, {id: res.locals.id})
    await em.removeAndFlush(review)
    res.json({message: "Review deleted successfully", data: review})
  } catch(e) {
    handleOrmError(res, e)
  }
}

//// *** Middlewarez *** ////

function sanitizeInput(req: Request, res: Response) {
  // Sanitizar id a un número
  if (req.params.id) {
    const id: number = Number.parseInt(req.params.id)
    if (!isNaN(id))
      res.locals.id = id
  }

  // TODO: Sanitizar input de title y body HTML
}

//// *** Helper functions *** ////

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case "ER_DUP_ENTRY":
        // No debería ocurrir. No hay atributos únicos en esta entidad
        res.status(400).json({message: `A review with those attributes already exists.`})
        break
      case "ER_DATA_TOO_LONG":
        res.status(400).json({message: `Data too long.`})
        break
    }
  }
  else {
    switch (err.name) {
      case "NotFoundError":
        res.status(404).json({message: `Review not found for ID ${res.locals.id}`})
        break
      default:
        console.error("\n--- ORM ERROR ---")
        console.error(err.message)
        res.status(500).json({message: ERR_500})
        break
    }
  }
}

function throw500(res: Response, err: any) {
  res.status(500).json({message: ERR_500})
}

export {findAll, findOne, remove, add,
  sanitizeInput}