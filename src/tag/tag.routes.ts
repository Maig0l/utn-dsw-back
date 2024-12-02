import { Router } from 'express'
import { sanitizeTagInput, sanitizePartialTagInput, findAll, findOne, add, update, remove, validateExists } from "./tag.controller.js";

export const tagRouter = Router()

tagRouter.get('/', findAll)
tagRouter.get('/:id',validateExists, findOne)
tagRouter.post('/', sanitizeTagInput, add)
tagRouter.put('/:id', validateExists, sanitizeTagInput, update)
tagRouter.patch('/:id', validateExists, sanitizePartialTagInput, update)
tagRouter.delete('/:id',validateExists, remove)