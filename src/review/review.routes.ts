import { Router } from "express";
import * as ctl from "./review.controller.js"

export const reviewRouter = Router()

reviewRouter.get('/', ctl.findAll)
reviewRouter.post('/', ctl.sanitizeInput, ctl.add)

reviewRouter.get('/:id', ctl.findOne)
reviewRouter.put('/:id', ctl.sanitizeInput, ctl.update)
reviewRouter.patch('/:id', ctl.sanitizeInput, ctl.update)
reviewRouter.delete('/:id', ctl.remove)
