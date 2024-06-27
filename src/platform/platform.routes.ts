import { Router } from "express";
import { sanitizePlatformInput, findAll, findOne, add, update, remove } from "./platform.controler.js";

export const platformRouter = Router()

platformRouter.get('/', findAll)
platformRouter.get('/:id',findOne)
platformRouter.post('/', sanitizePlatformInput, add)
platformRouter.put('/:id', sanitizePlatformInput, update)
platformRouter.patch('/:id', sanitizePlatformInput, update)
platformRouter.delete('/:id',remove)
