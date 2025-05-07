import { Request, Response, NextFunction, Router } from 'express';
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  validateExists,
  findGamesByTitle,
  findGamesByFilters,
  uploadPortrait,
  uploadBanner,
} from './game.controller.js';
import { listReviews, createReview } from '../review/review.controller.js';
import { upload } from '../shared/multer.js';

export const gameRouter = Router();

gameRouter.get('/filter', findGamesByFilters);
gameRouter.get('/search', findGamesByTitle); //create middleware?
gameRouter.get('/', findAll);
gameRouter.post(
  '/',
  //upload.fields([
  //  { name: "portrait", maxCount: 1 },
  //  { name: "banner", maxCount: 1 },
  //]),
  sanitizeInput,
  add
);

// (\\d+) es una regex para que Express acepte sólo números para la variable id
gameRouter.get('/:id(\\d+)', validateExists, findOne);
gameRouter.put('/:id(\\d+)', validateExists, sanitizeInput, update);
gameRouter.patch('/:id(\\d+)', validateExists, sanitizeInput, update);
gameRouter.delete('/:id(\\d+)', validateExists, remove);

gameRouter.get('/:id(\\d+)/reviews', validateExists, listReviews);
gameRouter.post('/:id(\\d+)/reviews', validateExists, createReview);

gameRouter.patch(
  '/:id(\\d+)/uploads/portrait',
  validateExists,
  upload.single('portrait'),
  uploadPortrait
);

gameRouter.patch(
  '/:id(\\d+)/uploads/banner',
  validateExists,
  upload.single('banner'),
  uploadBanner
);
