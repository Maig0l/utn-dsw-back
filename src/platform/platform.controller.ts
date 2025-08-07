import { NextFunction, Request, Response } from "express";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";
import { Platform } from "./platform.entity.js";
import { orm } from "../shared/db/orm.js";
import { validatePlatform } from "./platform.schema.js";
import { UPLOADS_PATH } from "../shared/multer.js";
import path from "path";

const VALID_PARAMS = "name img".split(" ");
const hasParams = paramCheckFromList(VALID_PARAMS);

const em = orm.em;

// Helper function para generar rutas de imágenes
function getImageUrl(filename: string): string {
  return `/uploads/${filename}`;
}

// Helper function para obtener la ruta física del archivo
function getImagePath(filename: string): string {
  return path.join(UPLOADS_PATH, filename);
}

async function findAll(req: Request, res: Response) {
  try {
    const platforms = await em.find(Platform, {});
    res.status(200).json({ message: "found all platforms", data: platforms });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(res.locals.id);
    const platform = await em.findOneOrFail(Platform, { id });
    res.status(200).json({ message: "found platform", data: platform });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function findPlatformsByName(req: Request, res: Response) {
  try {
    const name = req.query.name as string;
    const platforms = await em.find(Platform, { name: { $like: `%${name}%` } });
    res.status(200).json({ message: "found platforms", data: platforms });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function add(req: Request, res: Response) {
  const incoming = await validatePlatform(res.locals.sanitizedInput);
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues });

  const newPlatform = incoming.output;
  try {
    const platform = em.create(Platform, newPlatform);
    await em.flush();
    res.status(201).json({ message: "platform created", data: platform });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(res.locals.id);
    const platform = em.getReference(Platform, id);
    em.assign(platform, req.body);
    await em.flush();
    res.status(200).json({ message: "platform updated", data: platform });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(res.locals.id);
    const platform = em.getReference(Platform, id);
    await em.removeAndFlush(platform);
    res.status(200).send({ message: "platform deleted" });
  } catch (err) {
    handleOrmError(res, err);
  }
}

async function uploadImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(res.locals.id);

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const platform = await em.findOneOrFail(Platform, { id });

    // Guardar la imagen con la ruta relativa
    platform.img = getImageUrl(req.file.filename);
    await em.flush();

    res.status(200).json({
      message: "Platform image uploaded successfully",
      img: platform.img,
    });
  } catch (err) {
    handleOrmError(res, err);
  }
}

function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Para POST, solo name es obligatorio (img es opcional)
  if (["POST"].includes(req.method) && !req.body.name) {
    return res.status(400).json({ message: "Must provide name attribute" });
  }

  // Para PUT, todos los atributos son obligatorios
  if (["PUT"].includes(req.method) && !hasParams(req.body, true)) {
    return res.status(400).json({ message: "Must provide all attributes" });
  }

  if ("PATCH" == req.method && !hasParams(req.body, false))
    return res
      .status(400)
      .json({ message: "Must provide at least one valid attribute" });

  res.locals.sanitizedInput = {
    name: req.body.name,
  };

  // Solo incluir img si está presente y no es una cadena vacía
  if (req.body.img && req.body.img.trim() !== "") {
    res.locals.sanitizedInput.img = req.body.img;
  }

  // https://stackoverflow.com/a/3809435
  const urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  if (req.body.site && !urlRegex.test(req.body.site))
    return res
      .status(400)
      .json({ message: "Invalid Site attribute (Should be a URL)" });

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
          .json({ message: `A platform with that name already exists.` });
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
          .json({ message: `Platform not found for ID ${res.locals.id}` });
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
  findPlatformsByName,
  findAll,
  findOne,
  add,
  update,
  remove,
  uploadImage,
  sanitizeInput,
  validateExists,
};
