import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeInput, update, validateExists } from "./user.controller.js";

export const userRouter = Router()

userRouter.get('/', findAll)
userRouter.post('/', sanitizeInput, add)

userRouter.get('/:nick', findOne)
userRouter.put('/:nick', validateExists, sanitizeInput, update)
userRouter.patch('/:nick', validateExists, sanitizeInput, update)
userRouter.delete('/:nick', validateExists, sanitizeInput, remove)