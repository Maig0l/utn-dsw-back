import { Router } from 'express'
import { sanitizeTagInput, findAll, findOne, add, update, remove } from "./tag.controler.js";

export const tagRouter = Router()

tagRouter.get('/', findAll)
tagRouter.get('/:id', findOne)
tagRouter.post('/', sanitizeTagInput, add)
tagRouter.put('/:id', sanitizeTagInput, update)
tagRouter.patch('/:id', sanitizeTagInput, update)
tagRouter.delete('/:id', remove)