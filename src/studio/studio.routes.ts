import { Request, Response, NextFunction, Router } from 'express';
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  sanitizePartialInput,
  validateExists,
  findStudiosByName,
} from './studio.controller.js';
import { getAndSaveUserObjectsToResponseLocals, isAdminGuard } from '../auth/auth.middleware.js';

export const studioRouter = Router();

studioRouter.get('/search', findStudiosByName);
studioRouter.get('/', findAll);
studioRouter.post('/', getAndSaveUserObjectsToResponseLocals, isAdminGuard, sanitizeInput, add);

studioRouter.get('/:id(\\d+)', validateExists, findOne);
studioRouter.put(
  '/:id(\\d+)',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizeInput,
  update
);
studioRouter.patch(
  '/:id(\\d+)',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizePartialInput,
  update
);
studioRouter.delete(
  '/:id(\\d+)',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  remove
);
