import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Review } from "./review.entity.js";
import { validateNewReview } from "./review.schema.js";
import sanitizeHtml from "sanitize-html"

// Mensajes
const ERR_500 = "Oops! Something went wrong. This is our fault."

const em = orm.em

//// *** CRUD *** ////

async function findAll(req: Request, res: Response) {
  try {
    const reviews = await em.find(Review, {})
    res.json({ data: reviews })
  } catch (e) {
    handleOrmError(res, e)
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const review = await em.findOneOrFail(Review, { id: res.locals.id })
    res.json({ data: review })
  } catch (e) {
    handleOrmError(res, e)
  }
}

async function add(req: Request, res: Response) {
  try {
    const review = await em.create(Review, res.locals.newReview)
    await em.flush()

    res.status(201).json({ message: "Review created successfully", data: review })
  } catch (e) {
    handleOrmError(res, e)
  }
}

async function update(req: Request, res: Response) {
  res.status(501).json({ message: "Not implemented" })
}

async function remove(req: Request, res: Response) {
  try {
    const review = em.findOneOrFail(Review, { id: res.locals.id })
    await em.removeAndFlush(review)
    res.json({ message: "Review deleted successfully", data: review })
  } catch (e) {
    handleOrmError(res, e)
  }
}

//// *** Middlewarez *** ////

async function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id)
  if (Number.isNaN(id))
    return res.status(400).json({ message: "ID must be an integer" })

  res.locals.id = id

  next()
}

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const incoming = await validateNewReview(req.body)
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues[0].message })
  const newReview = incoming.output

  newReview.score = roundToNextHalf(newReview.score)
  if (newReview.title)
    newReview.title = sanitizeHtml(newReview.title)
  if (newReview.body)
    newReview.body = sanitizeHtml(newReview.body)

  res.locals.newReview = newReview
  next()
}

//// *** Helper functions *** ////

/** Redondear puntaje hacia arriba hasta el próximo medio punto
  * (por ej.: 3.1 => 3.5; 4.9 => 5.0) */
function roundToNextHalf(num: number) {
  const remainder = num % 0.5
  if (remainder)
    return num + (0.5 - remainder)
  return num
}

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case "ER_DUP_ENTRY":
        // No debería ocurrir. No hay atributos únicos en esta entidad
        res.status(400).json({ message: `A review with those attributes already exists.` })
        break
      case "ER_DATA_TOO_LONG":
        res.status(400).json({ message: `Data too long.` })
        break
    }
  }
  else {
    switch (err.name) {
      case "NotFoundError":
        res.status(404).json({ message: `Review not found for ID ${res.locals.id}` })
        break
      default:
        console.error("\n--- ORM ERROR ---")
        console.error(err.message)
        res.status(500).json({ message: ERR_500 })
        break
    }
  }
}

function throw500(res: Response, err: any) {
  res.status(500).json({ message: ERR_500 })
}

export {
  findAll, findOne, remove, add, sanitizeInput, validateExists, handleOrmError, update
}