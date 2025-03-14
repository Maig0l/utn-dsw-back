import { Router } from 'express';
import {
  sanitizeTagInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  validateExists,
  findTagsByName,
} from './tag.controller.js';

export const tagRouter = Router();

tagRouter.get('/search', findTagsByName);
tagRouter.get('/', findAll);
tagRouter.post('/', sanitizeTagInput, add);
tagRouter.get('/:id(\\d+)', validateExists, findOne);
tagRouter.put('/:id(\\d+)', validateExists, sanitizeTagInput, update);
tagRouter.patch('/:id(\\d+)', validateExists, sanitizeTagInput, update);
tagRouter.delete('/:id(\\d+)', validateExists, remove);
