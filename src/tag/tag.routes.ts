import { Router } from 'express'
import { sanitizeTagInput, findAll, findOne, add, update, remove, validateExists } from "./tag.controller.js";

export const tagRouter = Router()

tagRouter.get('/', findAll)
tagRouter.get('/:id',validateExists, findOne)
tagRouter.post('/', sanitizeTagInput, add)
tagRouter.put('/:id', validateExists, sanitizeTagInput, update)
tagRouter.patch('/:id', validateExists, sanitizeTagInput, update)
tagRouter.delete('/:id',validateExists, remove)