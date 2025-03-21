import { Request, Response, NextFunction } from 'express';
import { paramCheckFromList } from '../shared/paramCheckFromList.js';
import { orm } from '../shared/db/orm.js';
import { Shop } from './shop.entity.js';
import { validateNewShop, validateUpdateShop } from './shop.schema.js';

// Registrar parámetros válidos para un post/put/patch
const VALID_PARAMS = 'name img site'.split(' ');
const hasParams = paramCheckFromList(VALID_PARAMS);

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const shops = await em.find(Shop, {});
    res.json({ data: shops });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const shop = await em.findOneOrFail(Shop, { id: res.locals.id });
    res.json({ data: shop });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findShopsByName(req: Request, res: Response) {
  try {
    const name = req.query.name as string;
    const shops = await em.find(Shop, { name: { $like: `%${name}%` } });
    res.json({ data: shops });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function add(req: Request, res: Response) {
  try {
    const shop = em.create(Shop, res.locals.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Shop created successfully', data: shop });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function update(req: Request, res: Response) {
  try {
    const shop = await em.findOneOrFail(Shop, { id: res.locals.id });
    em.assign(shop, res.locals.sanitizedInput);
    await em.flush();
    res.json({ message: 'Shop updated', data: shop });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function remove(req: Request, res: Response) {
  try {
    // CONSULTA[ans]: Está bien hacer esta doble consulta? O getReference no va a la DB?
    const shop = await em.findOneOrFail(Shop, { id: res.locals.id });
    const shopRef = em.getReference(Shop, res.locals.id); // ANS: TODO: Quitar
    await em.removeAndFlush(shopRef);

    res.json({ message: 'Shop deleted successfully', data: shop });
  } catch (err) {
    handleOrmError(res, err);
  }
}

/**
 * MiddleWarez!
 */

/**
 * Todas las funciones que deban trabajar con input sanitizado,
 * que trabajen con los valores guardados en res.locals!
 * TODO: (Code Convention para el equipo)
 */
//middleware

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const incoming = await validateNewShop(req.body);
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues[0].message });
  const newShop = incoming.output;

  res.locals.sanitizedInput = newShop;

  next();
}

async function sanitizePartialInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const incoming = await validateUpdateShop(req.body);
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues[0].message });
  const newShop = incoming.output;

  res.locals.sanitizedInput = newShop;

  next();
}

/**
 * Se supone que sea pasado al router antes de las funciones que buscan por ID
 * Se asegura de que el ID existe, o devuelve el mismo 404/400
 */
function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id))
    return res.status(400).json({ message: 'ID must be an integer' });

  // const shop = repository.findOne({id})

  // if (!shop)
  //   return res.status(404).json({message: `Shop ${id} not found`})

  res.locals.id = id;
  // res.locals.shop = shop
  next();
}

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        res
          .status(400)
          .json({ message: `A shop with that name/site already exists.` });
        break;
      case 'ER_DATA_TOO_LONG':
        res.status(400).json({ message: `Data too long.` });
        break;
    }
  } else {
    switch (err.name) {
      case 'NotFoundError':
        res
          .status(404)
          .json({ message: `Shop not found for ID ${res.locals.id}` });
        break;
      default:
        console.error('\n--- ORM ERROR ---');
        console.error(err.message);
        res
          .status(500)
          .json({ message: 'Oops! Something went wrong. This is our fault.' });
        break;
    }
  }
}

export {
  findShopsByName,
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  sanitizePartialInput,
  validateExists,
};
