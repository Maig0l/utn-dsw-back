import { NextFunction, Request, Response } from 'express';
import { paramCheckFromList } from '../shared/paramCheckFromList.js';
import { Playlist } from './playlist.entity.js';
import { orm } from '../shared/db/orm.js';
import { validatePlaylist } from './playlist.schema.js';
import { User } from '../user/user.entity.js';

const VALID_PARAMS = 'name description is_private'.split(' ');
const hasParams = paramCheckFromList(VALID_PARAMS);

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const playlists = await em.find(Playlist, {});
    res.status(200).json({ message: 'found all playlists', data: playlists });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(res.locals.id);
    const playlist = await em.findOneOrFail(Playlist, { id });
    res.status(200).json({ message: 'found playlist', data: playlist });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function getPlaylistsByOwner(req: Request, res: Response) {
  try {
    const owner_id = Number.parseInt(req.query.owner as string);
    const owner: User = await em.findOneOrFail(User, { id: owner_id });
    const playlists = await em.find(Playlist, { owner: owner });
    res.status(200).json({ message: 'found playlists by owner', data: playlists });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function add(req: Request, res: Response) {
  //validar con schema
  try {
    const playlist = em.create(Playlist, req.body);
    await em.flush();
    res.status(201).json({ message: 'playlist created', data: playlist });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(res.locals.id);
    const playlist = em.getReference(Playlist, id);
    em.assign(playlist, req.body);
    await em.flush();
    res.status(200).json({ message: 'playlist updated', data: playlist });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(res.locals.id);
    const playlist = em.getReference(Playlist, id);
    await em.removeAndFlush(playlist);
    res.status(200).send({ message: 'playlist deleted' });
  } catch (err) {
    handleOrmError(res, err);
  }
}

function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT'].includes(req.method) && !hasParams(req.body, true))
    return res.status(400).json({ message: 'Must provide all attributes' });

  if ('PATCH' == req.method && !hasParams(req.body, false))
    return res.status(400).json({ message: 'Must provide at least one valid attribute' });

  res.locals.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
    is_private: req.body.is_private,
    owner: req.body.owner,
  };

  // https://stackoverflow.com/a/3809435
  const urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  if (req.body.site && !urlRegex.test(req.body.site))
    return res.status(400).json({ message: 'Invalid Site attribute (Should be a URL)' });

  // TODO: Revisar que no haya sanitización silenciosa
  Object.keys(res.locals.sanitizedInput).forEach((k) => {
    if (res.locals.sanitizedInput[k] === undefined) {
      delete res.locals.sanitizedInput[k];
    }
  });

  next();
}

function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) return res.status(400).json({ message: 'ID must be an integer' });

  res.locals.id = id;

  next();
}

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        res.status(400).json({ message: `A shop with that name/site already exists.` });
        break;
      case 'ER_DATA_TOO_LONG':
        res.status(400).json({ message: `Data too long.` });
        break;
    }
  } else {
    switch (err.name) {
      case 'NotFoundError':
        res.status(404).json({ message: `Shop not found for ID ${res.locals.id}` });
        break;
      default:
        console.error('\n--- ORM ERROR ---');
        console.error(err.message);
        res.status(500).json({ message: 'Oops! Something went wrong. This is our fault.' });
        break;
    }
  }
}

export {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  validateExists,
  getPlaylistsByOwner,
};
