import { Request, Response, NextFunction, Router } from "express";
import {findAll, findById, add, update, remove, sanitizeInput, validateExists} from "./studio.controller.js";


export const studioRouter = Router();

studioRouter.get("/", findAll);
studioRouter.post("/", sanitizeInput, add);

studioRouter.get("/:id", validateExists, findById);
studioRouter.put("/:id", validateExists, sanitizeInput, update);
studioRouter.patch("/:id", validateExists, update);
studioRouter.delete("/:id", validateExists, remove);
