/** Consulta 
 * Se puede embellecer esta maraña de imports¿
 */
import {Request, Response, NextFunction, Router} from 'express'
import {findOne, findAll, add, remove, update, validateExists,
  sanitizeInput} from './shop.controller.js'

export const shopRouter = Router()

shopRouter.get('/', findAll)
shopRouter.post('/', sanitizeInput, add)

shopRouter.get('/:id', validateExists, findOne)
shopRouter.put('/:id', validateExists, sanitizeInput, update)
shopRouter.patch('/:id', validateExists, sanitizeInput, update)
shopRouter.delete('/:id', validateExists, remove)