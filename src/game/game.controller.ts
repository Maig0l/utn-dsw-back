import { Request, Response, NextFunction } from 'express';
import { Game } from './game.entity.js';
import { validateGame, validateUpdateGame } from './game.schema.js';
import { paramCheckFromList } from '../shared/paramCheckFromList.js';
import { orm } from '../shared/db/orm.js';
import { EntityAssigner, EntityManager } from '@mikro-orm/core';

const API_SECRET = process.env.apiSecret ?? '';

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const games = await em.find(
      Game,
      {},
      {
        populate: ['tags', 'shops', 'platforms', 'studios', 'reviews', 'franchise'],
      }
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
      {
        populate: ['tags', 'shops', 'platforms', 'studios', 'reviews', 'franchise'],
      }
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

async function findGamesByFilters(req: Request, res: Response) {
  try {
    const filters = req.query as Record<string, string>;
    console.log('FILTERS', filters);
    const filterQuery: Record<string, any> = {};

    for (const key in filters) {
      const value = filters[key];

      if (key === 'platform' && value) {
        const platforms = value
          .split(',')
          .map(Number)
          .filter((v) => v > 0);
        if (platforms.length > 0) {
          filterQuery.platforms = { $in: platforms };
        }
      } else if (key === 'tags' && value) {
        const tags = value
          .split(',')
          .map(Number)
          .filter((v) => v > 0);
        if (tags.length > 0) {
          filterQuery.tags = { $in: tags };
        }
      } else if (key === 'studio' && value) {
        const studios = value
          .split(',')
          .map(Number)
          .filter((v) => v > 0);
        if (studios.length > 0) {
          filterQuery.studios = { $in: studios };
        }
      } else if (key === 'franchise' && value) {
        const franchises = value
          .split(',')
          .map(Number)
          .filter((v) => v > 0);
        if (franchises.length > 0) {
          filterQuery.franchise = { $in: franchises };
        }
      } else if (key === 'startDate' && value) {
        filterQuery.releaseDate = {
          ...(filterQuery.releaseDate || {}),
          $gte: value.split('T')[0],
        };
      } else if (key === 'endDate' && value) {
        filterQuery.releaseDate = {
          ...(filterQuery.releaseDate || {}),
          $lte: value.split('T')[0],
        };
      }
    }

    console.log('FILTER QUERY', filterQuery);

    // Fetch games from the database
    const games = await em.find(Game, filterQuery, {
      populate: ['tags', 'shops', 'platforms', 'studios', 'reviews', 'franchise'],
    });

    // Filter by starValue in memory
    const minStarValue = filters.minStarValue ? Number(filters.minStarValue) : null;
    const maxStarValue = filters.maxStarValue ? Number(filters.maxStarValue) : null;

    const filteredGames = games.filter((game) => {
      const starValue = game.reviewCount > 0 ? game.cumulativeRating / game.reviewCount : 0;

      if (minStarValue !== null && starValue < minStarValue) {
        return false;
      }
      if (maxStarValue !== null && starValue > maxStarValue) {
        return false;
      }
      return true;
    });

    console.log('FILTERED GAMES', filteredGames);

    res.json({ data: filteredGames });
  } catch (err) {
    console.error(err);
    handleOrmError(res, err);
  }
}

async function add(req: Request, res: Response) {
  try {
    console.log('SANITIZED INPUT ADD', res.locals.sanitizedInput);
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
    console.log('SANITIZED INPUT UPDATE', res.locals.sanitizedInput);

    // Si franchise es 0, establecerlo como null para desasociar
    if (res.locals.sanitizedInput.franchise === 0) {
      res.locals.sanitizedInput.franchise = null;
      console.log('Setting franchise to null');
    }

    const input = res.locals.sanitizedInput;

    const files = req.files as
      | {
          portrait?: Express.Multer.File[];
          banner?: Express.Multer.File[];
        }
      | undefined;

    if (files?.portrait?.[0]) {
      input.portrait = '/uploads/' + files.portrait[0].filename;
    }

    if (files?.banner?.[0]) {
      input.banner = '/uploads/' + files.banner[0].filename;
    }

    delete res.locals.cumulativeRating;
    delete res.locals.reviewCount;
    console.log('SANITIZED INPUT UPDATE 2', res.locals.sanitizedInput);

    const game = await em.findOneOrFail(Game, { id: res.locals.id });
    em.assign(game, res.locals.sanitizedInput);
    await em.flush();

    // Recargar el juego para obtener los datos actualizados
    await em.refresh(game);

    res.json({ message: 'Game updated', data: game });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function updateRating(gameId: number, newRating: number, em: EntityManager) {
  try {
    em.transactional(async (em) => {
      const game = await em.findOneOrFail(Game, { id: gameId });
      game.cumulativeRating += newRating;
      game.reviewCount += 1;
      await em.flush();
    });
  } catch (error) {
    console.error('Failed to update game rating:', error);
    console.log('Game ID:', gameId, 'New Rating:', newRating);
    console.log('EntityManager:', em);
    console.log('Game ID', gameId);
    throw new Error('Could not update game rating.');
  }
}

async function uploadPortrait(req: Request, res: Response) {
  const gameId = Number(req.params.id);
  const portrait = req.file?.filename;

  if (!portrait) {
    return res.status(400).json({ message: 'No portrait picture was uploaded' });
  }

  const game = await orm.em.findOne(Game, { id: gameId });
  if (!game) return res.status(404).json({ message: 'Game not found' });

  game.portrait = `/uploads/${portrait}`;
  await orm.em.flush();

  res.status(200).json({ message: 'Portrait picture uploaded', portrait: game.portrait });
}

async function uploadBanner(req: Request, res: Response) {
  const gameId = Number(req.params.id);
  const banner = req.file?.filename;

  if (!banner) {
    return res.status(400).json({ message: 'No banner picture was uploaded' });
  }

  const game = await orm.em.findOne(Game, { id: gameId });
  if (!game) return res.status(404).json({ message: 'Game not found' });

  game.banner = `/uploads/${banner}`;
  await orm.em.flush();

  res.status(200).json({ message: 'Banner picture uploaded', banner: game.banner });
}

// Podria ser 1 funcion que se bifurque, pero no me funcaba (?)

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
        res.status(404).json({ message: `Game not found for ID ${res.locals.id}` });
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
  uploadPortrait,
  uploadBanner,
  updateRating,
  findGamesByFilters,
};
