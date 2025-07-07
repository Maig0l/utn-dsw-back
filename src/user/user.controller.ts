import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";
import { orm } from "../shared/db/orm.js";
import { User } from "./user.entity.js";
import {
  validateLogin,
  validateRegistration,
  validateUserModification,
} from "./user.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserAuthObject } from "../auth/userAuthObject.interface.js";
import { getUserReferenceFromAuthHeader } from "../auth/auth.middleware.js";
import fs from "node:fs/promises";
import {existsSync} from "node:fs";

// TODO: I know this is sloppy, but there's no time
const API_SECRET = process.env.apiSecret ?? "";
const PASSWD_SALT_ROUNDS = 10;

// Mensajes de error
const ERR_500 = "Something went horribly wrong. Oops (this is our fault)";
const ERR_PARAMS_PATCH = "Must provide at least one valid attribute to update";
const ERR_PARAMS_MODIFY_PUT = "Must update all attributes";
const ERR_USED_NICK = "Nickname already in use";
const ERR_USED_EMAIL = "Email address already in use";

const em = orm.em;

// *** CRUD ***

// CONSULTA: Estoy empezando a pensar que no es muy buena idea devolver _todos_
//            los datos de un objeto User así a cualquiera

async function findAll(req: Request, res: Response) {
  try {
    const users = await em.find(User, {});
    res.json({ data: users });
  } catch (e) {
    handleOrmError(res, e);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const user = await em.findOneOrFail(
      User,
      { id: res.locals.id },
      {
        populate: [
          "bio_text",
          "linked_accounts",
          "playlists",
          "likedTags",
          "reviews",
        ],
      },
    );
    res.json({ data: user });
  } catch (e) {
    handleOrmError(res, e);
  }
}

// *** A.K.A: Register ***
async function add(req: Request, res: Response) {
  const incoming = await validateRegistration(res.locals.sanitizedInput);
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues });
  const newUserData = incoming.output;

  const matchingUser = await em.findOne(User, {
    $or: [{ nick: newUserData.nick }, { email: newUserData.email }],
  });
  if (matchingUser)
    return res.status(400).json({ message: "Nick or email already in use" });

  newUserData.password = hashPassword(newUserData.password);

  try {
    const user = em.create(User, newUserData);
    await em.flush();

    res.status(201).json({ message: "User created successfully", data: user });
  } catch (e) {
    handleOrmError(res, e);
  }
  await em.flush();
}

async function update(req: Request, res: Response) {
  // TODO: Tal vez pedir también la contraseña para cambiar atributos como el email o passwd
  if (req.method === "PATCH" && !validateUserModification(req.body))
    return res.status(400).json({ message: ERR_PARAMS_PATCH });

  if (req.method === "PUT" && !validateRegistration(req.body))
    return res.status(400).json({ message: ERR_PARAMS_MODIFY_PUT });

  const input = res.locals.sanitizedInput;
  // Esto va acá?
  // Esto deberia ir en el patch
  const image = req.files as {
    profile_img?: Express.Multer.File[];
  };

  if (image?.profile_img?.[0]) {
    input.profile_img = "/uploads/" + image.profile_img[0].filename;
  }

  try {
    // TODO: Qué pasa si en el input viene para cambiar el id?
    // Debería sacarlo la sanitización?

    const user = await em.findOneOrFail(User, { id: res.locals.id });
    em.assign(user, res.locals.sanitizedInput);

    await em.flush();

    res.json({ message: "User updated", data: user });
  } catch (e) {
    handleOrmError(res, e);
  }
}

/** @deprecated */
async function uploadImg(req: Request, res: Response) {
  const userId = Number(req.params.id); // Aca deberia el token (Creo)
  const profile_img = req.file?.filename;

  if (!profile_img) {
    return res.status(400).json({ message: "No picture uploaded" });
  }

  const user = await orm.em.findOne(User, { id: userId });
  if (!user) return res.status(404).json({ message: "User not finded" });

  user.profile_img = `/uploads/${profile_img}`;
  await orm.em.flush();

  res
    .status(200)
    .json({ message: "Profile pic uploaded", profile_img: user.profile_img });
}

async function remove(req: Request, res: Response) {
  try {
    const user = await em.findOneOrFail(User, { id: res.locals.id });
    await em.removeAndFlush(user);
    res.json({ message: "User deleted successfully", data: user });
  } catch (e) {
    handleOrmError(res, e);
  }
}

async function login(req: Request, res: Response) {
  const ERR_LOGIN_BAD_CREDS = "Invalid user/pass";

  const incoming = await validateLogin(res.locals.sanitizedInput);
  if (!incoming.success)
    return res.status(400).json({ message: ERR_LOGIN_BAD_CREDS });
  const loginData = incoming.output;

  // Uso findOne y no findOneOrFail para devolver el error LOGIN_BAD_CREDS, no un ERR_404 del handleOrmError
  let user;
  try {
    user = await em.findOne(User, { nick: loginData.nick });
  } catch (e) {
    throw500(res, e);
  }
  if (!user) return res.status(400).json({ message: ERR_LOGIN_BAD_CREDS });

  const passwdIsCorrect = await bcrypt.compare(
    loginData.password,
    user.password,
  );
  if (!passwdIsCorrect)
    return res.status(400).json({ message: ERR_LOGIN_BAD_CREDS });

  // Generar JWT con el ID del usuario y otros datos que quieras incluir

  // user.id es number|undefined, pero en este caso el id debería estar sí o sí
  if (!user.id) return res.status(500).json({ message: "Unknown error" });

  const tokenData: UserAuthObject = {
    iss: "Wellplayed.gg",
    sub: "UserDataToken",
    id: user.id,
    nick: user.nick,
    isAdmin: false, //TODO: add admin property
  };
  // 1 semana = 168 hs
  const token = jwt.sign(tokenData, API_SECRET, { expiresIn: "168h" });

  res.json({ message: "Login successful", data: { token: token } });
}

async function logout(req: Request, res: Response) {}

async function changeProfilePicture(req: Request, res: Response, next: NextFunction) {
  let user;
  try {
    user = getUserReferenceFromAuthHeader(req.headers.authorization);
  } catch (err) {
    return res.status(403).json( {message: "Invalid Token"} );
  }
  user = await em.findOneOrFail(User, user);

  if (!req.file)
    return res.status(500).json( {message: "Something went wrong during file upload"} );


  const oldFile=`uploads/${user.profile_img}`;
  if (existsSync(oldFile))
    await fs.unlink(oldFile)
  user.profile_img = req.file.filename
  await em.flush();
  res.json( {message: "Profile picture updated OK"} )
}

/* *** Helper functions ***
 */

function hashPassword(passwd: string): string {
  return bcrypt.hashSync(passwd, PASSWD_SALT_ROUNDS);
}

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case "ER_DUP_ENTRY":
        if (err.message.includes("nick"))
          res.status(400).json({ message: ERR_USED_NICK });
        else if (err.message.includes("email"))
          res.status(400).json({ message: ERR_USED_EMAIL });
        else
          res
            .status(400)
            .json({ message: `A user with those attributes already exists.` });
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        // TODO: Devolver un error dinámico que indique que el email o nick ya está usado, no cualquier atributo)
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
          .json({ message: `User not found for ID ${res.locals.id}` });
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

function throw500(res: Response, err: any) {
  res.status(500).json({ message: ERR_500 });
}

/* *** Middlewarez ***
 */

function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id);
  if (Number.isNaN(id))
    return res.status(400).json({ message: "ID must be an integer" });

  // const user = repo.findOne({id})
  // if (!user)
  //   return res.status(404).json({message: `User ${req.params.id} not found`})

  res.locals.id = id;
  // res.locals.user = user

  next();
}

// Se ejecuta al crear o modificar un registro
async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const incoming = await validateUserModification(req.body);
  if (!incoming.success)
    return res.status(400).json({ message: incoming.issues[0].message });
  const userModifications = incoming.output;

  res.locals.sanitizedInput = userModifications;

  if (userModifications.bio_text)
    userModifications.bio_text = sanitizeHtml(userModifications.bio_text, {
      allowedTags: ["b", "i", "em", "strong", "a"],
      allowedAttributes: {
        a: ["href"],
      },
    });

  Object.keys(res.locals.sanitizedInput).forEach((k) => {
    if (res.locals.sanitizedInput[k] === undefined)
      delete res.locals.sanitizedInput[k];
  });

  next();
}

export {
  findAll,
  findOne,
  add,
  update,
  remove,
  validateExists,
  sanitizeInput,
  login,
  uploadImg,
  changeProfilePicture,
};
