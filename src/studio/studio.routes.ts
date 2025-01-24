import { Request, Response, NextFunction, Router } from "express";
import {findAll, findOne, add, update, remove, sanitizeInput, sanitizePartialInput, validateExists} from "./studio.controller.js";


export const studioRouter = Router();

studioRouter.get("/", findAll);
studioRouter.post("/", sanitizeInput, add);

studioRouter.get("/:id", validateExists, findOne);
studioRouter.put("/:id", validateExists, sanitizeInput, update);
studioRouter.patch("/:id", validateExists, sanitizePartialInput, update);
studioRouter.delete("/:id", validateExists, remove);
