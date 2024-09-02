import {Router} from 'express';
import {findAll, findOne, add, remove, sanitizeInput, update} from './release.controller.js'
import { validateExists } from '../platform/platform.controller.js';

export const releaseRouter = Router();

releaseRouter.get('/', findAll);
releaseRouter.post('/', sanitizeInput ,add);

releaseRouter.get('/:id', validateExists, findOne);
releaseRouter.delete('/:id', validateExists, remove);
releaseRouter.patch('/:id', validateExists, update);
