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
import { get } from 'http';

export const playlistRouter = Router();

playlistRouter.get('/search', getPlaylistsByOwner);
playlistRouter.get('/', findAll);
playlistRouter.post('/', sanitizeInput, add);
playlistRouter.get('/:id', validateExists, findOne);
playlistRouter.put('/:id', validateExists, sanitizeInput, update);
playlistRouter.patch('/:id', validateExists, sanitizeInput, update);
playlistRouter.delete('/:id', validateExists, remove);
