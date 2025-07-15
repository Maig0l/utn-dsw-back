import { Request, Response, NextFunction } from "express";

import { Franchise } from "./franchise.entity.js";
import { orm } from "../shared/db/orm.js";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";
import {
  validateNewFranchise,
  validateUpdateFranchise,
} from "./franchise.schema.js";
import {Game} from "../game/game.entity.js";
import {AssertionError} from "node:assert";

//const VALID_PARAMS = 'name description'.split(' ');
//const hasParams = paramCheckFromList(VALID_PARAMS);
const em = orm.em;

async function findFranchisesByName(req: Request, res: Response) {
  try {
    const name = req.query.name as string;
    const franchises = await em.find(Franchise, {
      name: { $like: `%${name}%` },
    }, {
        populate: [
          "games",
        ],
      });
    res.json({ data: franchises });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const franchises = await em.find(Franchise, {},  {
        populate: [
          "games",
        ],
      });
    res.json({ data: franchises });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const franchise = await em.findOneOrFail(Franchise, { id: res.locals.id }, {
        populate: [
          "games",
        ],
      });
    res.json({ data: franchise });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function add(req: Request, res: Response) {
  try {
    const franchise = em.create(Franchise, req.body);
    await em.flush();
    res.status(201).json({ message: "Franchise created", data: franchise });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  const id = Number.parseInt(res.locals.id);
  const franchise = await em.findOne(Franchise, id);
  if (!franchise) throw new AssertionError();

  let newGameCollection: Game[] = [];

  if (req.body.games) {
    newGameCollection = await em.find(Game, {id: {$in: req.body.games}})
  }


  try {
    await franchise.games.init();
    franchise.games.removeAll();
    em.assign(franchise, {...req.body, newGameCollection});
    await em.flush();
    res.status(200).json({ message: "Franchise updated", data: franchise });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const franchise = await em.findOneOrFail(Franchise, { id: res.locals.id });
    const franchiseRef = em.getReference(Franchise, res.locals.id);
    await em.removeAndFlush(franchiseRef);

    res.json({ message: "Franchise deleted successfully", data: franchise });
  } catch (err) {
    handleOrmError(res, err);
  }
}

//middleware

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const incoming = await validateNewFranchise(req.body);
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues[0].message });
  const newFranchise = incoming.output;

  res.locals.sanitizedInput = newFranchise;

  next();
}

async function sanitizePartialInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const incoming = await validateUpdateFranchise(req.body);
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues[0].message });
  const newFranchise = incoming.output;

  res.locals.sanitizedInput = newFranchise;

  next();
}

function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id))
    return res.status(400).json({ message: "ID must be an integer" });

  res.locals.id = id;

  next();
}

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case "ER_DUP_ENTRY":
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        res
          .status(400)
          .json({ message: `A tag with that name/site already exists.` });
        break;
      case "ER_DATA_TOO_LONG":
        res.status(400).json({ message: `Data too long.` });
        break;
    }
  } else {
    switch (err.name) {
      case "NotFoundError":
        res
          .status(404)
          .json({ message: `franchise not found for ID ${res.locals.id}` });
        break;
      default:
        console.error("\n--- ORM ERROR ---");
        console.error(err.message);
        res
          .status(500)
          .json({ message: "Oops! Something went wrong. This is our fault." });
        break;
    }
  }
}

export {
  findFranchisesByName,
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  sanitizePartialInput,
  validateExists,
};
