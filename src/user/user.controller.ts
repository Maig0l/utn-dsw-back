import { Request, Response, NextFunction } from "express";
import { UserRepository } from "./user.repository.js";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";

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
  next()
}

export {findAll, findOne, add, update, remove, validateExists, sanitizeInput}