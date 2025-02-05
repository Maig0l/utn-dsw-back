import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { GamePicture } from './game-picture.entity.js';
import { Game } from '../game/game.entity.js';
import { paramCheckFromList } from '../shared/paramCheckFromList.js';

const em = orm.em;

async function addPicture(req: Request, res: Response) {
  try {
    const game = await em.findOneOrFail(Game, {
      id: res.locals.sanitizedInput.game_id,
    });
    for (let i = 0; i < res.locals.sanitizeInput.urls.length; i++) {
      const picture = em.create(GamePicture, {
        url: res.locals.sanitizeInput.urls[i],
        game: game,
      });
      await em.flush();
    }
    res.json({ message: 'Picture added', data: res.locals.sanitizeInput.urls });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function removePicture(req: Request, res: Response) {
  try {
    const picture = await em.findOneOrFail(GamePicture, {
      id: res.locals.sanitizedInput.pic_id,
    });
    const pictureRef = em.getReference(
      GamePicture,
      res.locals.sanitizedInput.pic_id
    );
    await em.removeAndFlush(pictureRef);

    res.json({ message: 'Picture deleted successfully', data: picture });
  } catch (err) {
    handleOrmError(res, err);
  }
}

function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  res.locals.sanitizedInput = {
    pic_id: req.body.pic_id,
    game_id: req.body.game_id,
    urls: req.body.urls,
  };
  const sanitizedInput = res.locals.sanitizedInput;

  Object.keys(sanitizedInput).forEach((key) => {
    if (sanitizedInput[key] === undefined) {
      delete sanitizedInput[key];
    }
  });
  next();
}

function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);

  if (Number.isNaN(id))
    return res.status(400).json({ message: 'ID must be an integer' });

  res.locals.id = id;

  next();
}

function handleOrmError(res: Response, err: any) {
  console.error('\n--- ORM ERROR ---');
  console.error(err.message);

  if (err.code) {
    switch (err.code) {
      case 'ER_DATA_TOO_LONG':
        res.status(400).json({ message: `Data too long.` });
        break;
    }
  } else {
    switch (err.name) {
      case 'NotFoundError':
        res
          .status(404)
          .json({ message: `game not found for ID ${res.locals.id}` });
        break;
      default:
        res
          .status(500)
          .json({ message: 'Oops! Something went wrong. This is our fault.' });
        break;
    }
  }
}

export { addPicture, removePicture, sanitizeInput, validateExists };
