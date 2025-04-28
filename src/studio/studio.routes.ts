import { Request, Response, NextFunction, Router } from "express";
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  sanitizePartialInput,
  validateExists,
  findStudiosByName,
} from "./studio.controller.js";

export const studioRouter = Router();

studioRouter.get("/search", findStudiosByName);
studioRouter.get("/", findAll);
studioRouter.post("/", sanitizeInput, add);

studioRouter.get("/:id(\\d+)", validateExists, findOne);
studioRouter.put("/:id(\\d+)", validateExists, sanitizeInput, update);
studioRouter.patch("/:id(\\d+)", validateExists, sanitizePartialInput, update);
studioRouter.delete("/:id(\\d+)", validateExists, remove);
