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

export const platformRouter = Router();

platformRouter.get('/search', findPlatformsByName);
platformRouter.get('/', findAll);
platformRouter.post('/', sanitizeInput, add);
platformRouter.get('/:id', validateExists, findOne);
platformRouter.put('/:id', validateExists, sanitizeInput, update);
platformRouter.patch('/:id', validateExists, sanitizeInput, update);
platformRouter.patch('/:id/upload', validateExists, upload.single('img'), uploadImage);
platformRouter.delete('/:id', validateExists, remove);
