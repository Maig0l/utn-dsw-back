import { Router } from 'express';
import {
  findOne,
  findAll,
  add,
  remove,
  update,
  validateExists,
  sanitizeInput,
  findPlatformsByName,
} from './platform.controller.js';

export const platformRouter = Router();

platformRouter.get('/search', findPlatformsByName);
platformRouter.get('/', findAll);
platformRouter.post('/', sanitizeInput, add);
platformRouter.get('/:id', validateExists, findOne);
platformRouter.put('/:id', validateExists, sanitizeInput, update);
platformRouter.patch('/:id', validateExists, sanitizeInput, update);
platformRouter.delete('/:id', validateExists, remove);
