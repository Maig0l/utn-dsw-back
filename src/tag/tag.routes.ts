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
import { getAndSaveUserObjectsToResponseLocals, isAdminGuard } from '../auth/auth.middleware.js';

export const tagRouter = Router();

tagRouter.get('/search', findTagsByName);
tagRouter.get('/', findAll);
tagRouter.post('/', getAndSaveUserObjectsToResponseLocals, isAdminGuard, sanitizeTagInput, add);
tagRouter.get('/:id(\\d+)', validateExists, findOne);
tagRouter.put(
  '/:id(\\d+)',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizeTagInput,
  update
);
tagRouter.patch(
  '/:id(\\d+)',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizeTagInput,
  update
);
tagRouter.delete(
  '/:id(\\d+)',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  remove
);
