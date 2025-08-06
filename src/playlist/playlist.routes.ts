import { Router } from 'express';
import {
  findOne,
  findAll,
  add,
  remove,
  update,
  validateExists,
  sanitizeInput,
  getPlaylistsByOwner,
} from './playlist.controller.js';
import { getAndSaveUserObjectsToResponseLocals, isAdminGuard } from '../auth/auth.middleware.js';
import { get } from 'http';

export const playlistRouter = Router();

playlistRouter.get('/search', getPlaylistsByOwner);
playlistRouter.get('/', findAll);
playlistRouter.post('/', getAndSaveUserObjectsToResponseLocals, isAdminGuard, sanitizeInput, add);
playlistRouter.get('/:id', validateExists, findOne);
playlistRouter.put(
  '/:id',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizeInput,
  update
);
playlistRouter.patch(
  '/:id',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  sanitizeInput,
  update
);
playlistRouter.delete(
  '/:id',
  getAndSaveUserObjectsToResponseLocals,
  isAdminGuard,
  validateExists,
  remove
);
