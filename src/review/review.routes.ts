import { Router } from "express";
import * as c from "./review.controller.js"

export const reviewRouter = Router()

reviewRouter.use(c.sanitizeInput)

reviewRouter.get('/', c.findAll)
reviewRouter.post('/', c.add)

reviewRouter.use('/:id')
reviewRouter.get('')