import { Router } from 'express'
import { sanitizeInput, findAll, findOne, add, update, remove, validateExists } from "./tag.controler.js";

export const tagRouter = Router()

tagRouter.get('/', findAll)
tagRouter.get('/:id',validateExists, findOne)
tagRouter.post('/', sanitizeInput, add)
tagRouter.put('/:id', validateExists, sanitizeInput, update)
tagRouter.patch('/:id', validateExists, sanitizeInput, update)
tagRouter.delete('/:id',validateExists, remove)