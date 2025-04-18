import { Router } from 'express';
import * as ctl from './review.controller.js';

export const reviewRouter = Router();

reviewRouter.get('/', ctl.listReviews);
reviewRouter.post('/', ctl.sanitizeInput, ctl.add);

reviewRouter.get('/:id', ctl.validateExists, ctl.findOne);
// reviewRouter.put('/:id', ctl.sanitizeInput, ctl.update)
reviewRouter.patch('/:id', ctl.validateExists, ctl.sanitizeInput, ctl.update);
reviewRouter.delete('/:id', ctl.validateExists, ctl.remove);
