import { Request, Response, NextFunction, Router } from 'express';
import {
  findGamesByTitle,
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  validateExists,
  createReview,
  listReviews,
} from './game.controller.js';

export const gameRouter = Router();

gameRouter.get('/search', findGamesByTitle); //create middleware?
gameRouter.get('/', findAll);
gameRouter.post('/', sanitizeInput, add);

gameRouter.get('/:id', validateExists, findOne);
gameRouter.put('/:id', validateExists, sanitizeInput, update);
gameRouter.patch('/:id', validateExists, sanitizeInput, update);
gameRouter.delete('/:id', validateExists, remove);

gameRouter.get('/:id/reviews', validateExists, listReviews);
gameRouter.post('/:id/reviews', validateExists, createReview);
