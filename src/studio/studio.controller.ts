import { Request, Response, NextFunction } from "express";
import { Studio } from "./studio.entity.js";
import { orm } from "../shared/db/orm.js";
import { validateNewStudio, validateUpdateStudio } from "./studio.schema.js";

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const studios = await em.find(Studio, {});
    res.json({ data: studios });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const studio = await em.findOneOrFail(Studio, { id: res.locals.id });
    res.json({ data: studio });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findStudiosByName(req: Request, res: Response) {
  try {
    const name = req.query.name as string;
    const studios = await em.find(Studio, { name: { $like: `%${name}%` } });
    res.json({ data: studios });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function add(req: Request, res: Response) {
  try {
    const studio = em.create(Studio, res.locals.sanitizedInput);
    await em.flush();
    res
      .status(201)
      .json({ message: "Studio created successfully", data: studio });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function update(req: Request, res: Response) {
  try {
    const studio = await em.findOneOrFail(Studio, { id: res.locals.id });
    em.assign(studio, res.locals.sanitizedInput);
    await em.flush();
    res.json({ message: "Studio updated", data: studio });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function remove(req: Request, res: Response) {
  try {
    const studio = await em.findOneOrFail(Studio, { id: res.locals.id });
    const studioRef = em.getReference(Studio, res.locals.id);
    await em.removeAndFlush(studioRef);

    res.json({ message: "Studio deleted successfully", data: studio });
  } catch (err) {
    handleOrmError(res, err);
  }
}

//middleware

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const incoming = await validateNewStudio(req.body);
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues[0].message });
  const newStudio = incoming.output;

  res.locals.sanitizedInput = newStudio;

  next();
}

async function sanitizePartialInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const incoming = await validateUpdateStudio(req.body);
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues[0].message });
  const newStudio = incoming.output;

  res.locals.sanitizedInput = newStudio;

  next();
}

// santizacion del tipo

function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);

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
          .json({ message: `A studio with that name/site already exists.` });
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
          .json({ message: `Studio not found for ID ${res.locals.id}` });
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
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  sanitizePartialInput,
  validateExists,
  findStudiosByName,
};
