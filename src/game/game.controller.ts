import { Request, Response, NextFunction } from 'express';
import { Game } from './game.entity.js';
import { validateGame, validateUpdateGame } from './game.schema.js';
import { paramCheckFromList } from '../shared/paramCheckFromList.js';
import { orm } from '../shared/db/orm.js';

const API_SECRET = process.env.apiSecret ?? '';

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const games = await em.find(
      Game,
      {},
      { populate: ['tags', 'shops', 'platforms', 'studios', 'reviews', 'franchise', 'pictures'] }
    );
    res.json({ data: games });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const game = await em.findOneOrFail(
      Game,
      { id: res.locals.id },
      { populate: ['tags', 'shops', 'platforms', 'studios', 'reviews', 'franchise', 'pictures'] }
    );
    res.json({ data: game });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findGamesByTitle(req: Request, res: Response) {
  try {
    const title = req.query.title as string;
    const games = await em.find(Game, { title: { $like: `%${title}%` } });
    res.json({ data: games });
  } catch (err) {
    console.error(err);
    handleOrmError(res, err);
  }
}

async function add(req: Request, res: Response) {
  try {
    // TODO: Por qué hacemos esto?
    console.log('SANITIZED INPUT', res.locals.sanitizedInput);
    if (res.locals.sanitizedInput.franchise === 0) {
      delete res.locals.sanitizedInput.franchise;
    }
    const game = em.create(Game, res.locals.sanitizedInput);
    await em.flush();
    res.status(201).json(game);
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function update(req: Request, res: Response) {
  try {
    console.log('SANITIZED INPUT', res.locals.sanitizedInput);
    if (res.locals.sanitizedInput.franchise === 0) {
      delete res.locals.sanitizedInput.franchise;
    }
    const game = await em.findOneOrFail(Game, { id: res.locals.id });
    em.assign(game, res.locals.sanitizedInput);
    await em.flush();
    res.json({ message: 'Game updated', data: game });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function remove(req: Request, res: Response) {
  try {
    const game = await em.findOneOrFail(Game, { id: res.locals.id });
    const gameRef = em.getReference(Game, res.locals.id);
    await em.removeAndFlush(gameRef);

    res.json({ message: 'Game deleted successfully', data: game });
  } catch (err) {
    handleOrmError(res, err);
  }
}

//middleware

// santizacion del tipo

function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'ID must be an integer' });
  res.locals.id = id;
  next();
}

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  let incoming;
  switch (req.method) {
    case 'PATCH':
      incoming = await validateUpdateGame(req.body);
      break;
    case 'POST':
    default:
      incoming = await validateGame(req.body);
      break;
  }

  if (!incoming.success) {
    console.log(incoming.issues[0]);
    return res.status(400).json({ message: `: ${incoming.issues[0].message}` });
  }
  const Game = incoming.output;

  res.locals.sanitizedInput = Game;
  next();
}

function handleOrmError(res: Response, err: any) {
  console.error('\n--- ORM ERROR ---');
  console.error(err.message);

  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        res.status(400).json({ message: `A game with that name/site already exists.` });
        break;
      case 'ER_DATA_TOO_LONG':
        res.status(400).json({ message: `Data too long.` });
        break;
    }
  } else {
    switch (err.name) {
      case 'NotFoundError':
        res.status(404).json({ message: `game not found for ID ${res.locals.id}` });
        break;
      default:
        res.status(500).json({ message: 'Oops! Something went wrong. This is our fault.' });
        break;
    }
  }
}

export {
  findGamesByTitle,
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  handleOrmError,
  validateExists,
};
