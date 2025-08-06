import { Router } from 'express';
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  sanitizePartialInput,
  validateExists,
  findFranchisesByName,
} from './franchise.controller.js';
import { getAndSaveUserObjectsToResponseLocals, isAdminGuard } from '../auth/auth.middleware.js';

export const franchiseRouter = Router();

franchiseRouter.get('/search', findFranchisesByName);
franchiseRouter.get('/', findAll);
franchiseRouter.post('/', getAndSaveUserObjectsToResponseLocals, isAdminGuard, sanitizeInput, add);

franchiseRouter.get('/:id(\\d+)', validateExists, findOne);
franchiseRouter.put(
  '/:id(\\d+)',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizeInput,
  update
);
franchiseRouter.patch(
  '/:id(\\d+)',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizePartialInput,
  update
);
franchiseRouter.delete(
  '/:id(\\d+)',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  remove
);
