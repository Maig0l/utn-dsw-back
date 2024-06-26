/** Consulta 
 * Se puede embellecer esta maraña de imports¿
 */
import {Request, Response, NextFunction, Router} from 'express'
import {findOne, findAll, add, remove, update, validateExists,
  sanitizeInput} from './shop.controller.js'

const shopRouter = Router()

shopRouter.get('/', findAll)
shopRouter.post('/', sanitizeInput, add)

shopRouter.get('/:id', validateExists, findOne)
shopRouter.delete('/:id', validateExists, remove)
shopRouter.patch('/:id', validateExists, sanitizeInput, update)
shopRouter.put('/:id', validateExists, sanitizeInput, update)