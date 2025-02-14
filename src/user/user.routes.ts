import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeInput, update, validateExists, login } from "./user.controller.js";

export const userRouter = Router()

userRouter.get('/', findAll)
userRouter.post('/', sanitizeInput, add)
userRouter.post('/login', sanitizeInput, login) // TODO: Move to an /auth endpoint

// Todas las rutas /:id usan el validateExists
userRouter.use('/:id', validateExists)

userRouter.get('/:id', findOne)
userRouter.put('/:id', sanitizeInput, update)
userRouter.patch('/:id', sanitizeInput, update)
userRouter.delete('/:id', remove)
