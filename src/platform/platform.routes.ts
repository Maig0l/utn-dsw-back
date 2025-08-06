import { Router } from 'express';
import {
  findOne,
  findAll,
  add,
  remove,
  update,
  uploadImage,
  validateExists,
  sanitizeInput,
  findPlatformsByName,
} from './platform.controller.js';
import { upload } from '../shared/multer.js';
import { getAndSaveUserObjectsToResponseLocals, isAdminGuard } from '../auth/auth.middleware.js';

export const platformRouter = Router();

platformRouter.get('/search', findPlatformsByName);
platformRouter.get('/', findAll);
platformRouter.post('/', getAndSaveUserObjectsToResponseLocals, isAdminGuard, sanitizeInput, add);
platformRouter.get('/:id', validateExists, findOne);
platformRouter.put(
  '/:id',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizeInput,
  update
);
platformRouter.patch(
  '/:id',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizeInput,
  update
);
platformRouter.patch(
  '/:id/upload',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  upload.single('img'),
  uploadImage
);
platformRouter.delete(
  '/:id',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  remove
);
