import { Request, Response, NextFunction } from 'express';
import { Tag } from './tag.entity.js';
import { orm } from '../shared/db/orm.js';
import { validateTag, validateUpdateTag } from './tag.schema.js';

const em = orm.em;

async function findTagsByName(req: Request, res: Response) {
  try {
    const name = req.query.name as string;
    const tags = await em.find(Tag, { name: { $like: `%${name}%` } });
    res.json({ data: tags });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const tags = await em.find(Tag, {});
    res.json({ data: tags });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const tag = await em.findOneOrFail(Tag, { id: res.locals.id });
    res.json({ data: tag });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function add(req: Request, res: Response) {
  try {
    const tag = em.create(Tag, req.body);
    await em.flush();
    res.status(201).json({ message: 'tag created', data: tag });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(res.locals.id);
    const tag = em.getReference(Tag, id);
    em.assign(tag, req.body);
    await em.flush();
    res.status(200).json({ message: 'tag updated', data: tag });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const tag = await em.findOneOrFail(Tag, { id: res.locals.id });
    const tagRef = em.getReference(Tag, res.locals.id);
    await em.removeAndFlush(tagRef);

    res.json({ message: 'Tag deleted successfully', data: tag });
  } catch (err) {
    handleOrmError(res, err);
  }
}

function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'ID must be an integer' });
  res.locals.id = id;
  next();
}

async function sanitizeTagInput(req: Request, res: Response, next: NextFunction) {
  let incoming;
  switch (req.method) {
    case 'PATCH':
      incoming = await validateUpdateTag(req.body);
      break;
    case 'POST':
    default:
      incoming = await validateTag(req.body);
      break;
  }

  if (!incoming.success) {
    console.log(incoming.issues[0]);
    return res.status(400).json({ message: `: ${incoming.issues[0].message}` });
  }
  const Tag = incoming.output;

  res.locals.sanitizedInput = Tag;
  next();
}

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        res.status(400).json({ message: `A tag with that name already exists.` });
        break;
      case 'ER_DATA_TOO_LONG':
        res.status(400).json({ message: `Data too long.` });
        break;
    }
  } else {
    switch (err.name) {
      case 'NotFoundError':
        res.status(404).json({ message: `Tag not found for ID ${res.locals.id}` });
        break;
      default:
        console.error('\n--- ORM ERROR ---');
        console.error(err.message);
        res.status(500).json({ message: 'Oops! Something went wrong. This is our fault.' });
        break;
    }
  }
}

export { sanitizeTagInput, findTagsByName, findAll, findOne, add, update, remove, validateExists };
