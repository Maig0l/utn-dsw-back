import { Request, Response, NextFunction, Router } from 'express';
import {
  findOne,
  findAll,
  add,
  remove,
  update,
  validateExists,
  sanitizeInput,
  sanitizePartialInput,
  findShopsByName,
} from './shop.controller.js';
import { getAndSaveUserObjectsToResponseLocals, isAdminGuard } from '../auth/auth.middleware.js';

export const shopRouter = Router();

shopRouter.get('/search', findShopsByName);
shopRouter.get('/', findAll);
shopRouter.post('/', getAndSaveUserObjectsToResponseLocals, isAdminGuard, sanitizeInput, add);

shopRouter.get('/:id', validateExists, findOne);
shopRouter.put(
  '/:id',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizeInput,
  update
);
shopRouter.patch(
  '/:id',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizePartialInput,
  update
);
shopRouter.delete(
  '/:id',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  remove
);
