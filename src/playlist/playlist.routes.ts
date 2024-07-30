import { Router } from "express";
import { findOne, findAll, add, remove, update, validateExists,
  sanitizeInput} from "./playlist.controller.js";

export const playlistRouter = Router()

playlistRouter.get('/', findAll)
playlistRouter.post('/', sanitizeInput, add)
playlistRouter.get('/:id', validateExists, findOne)
playlistRouter.put('/:id', validateExists, sanitizeInput, update)
playlistRouter.patch('/:id', validateExists, sanitizeInput, update)
playlistRouter.delete('/:id', validateExists, remove)