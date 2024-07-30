import { Request, Response, NextFunction, Router } from "express";
import {findAll, findOne, add, update, remove, sanitizeInput, validateExists} from "./game.controller.js";


export const gameRouter = Router();

gameRouter.get("/", findAll);
gameRouter.post("/", sanitizeInput, add);

gameRouter.get("/:id", validateExists, findOne);
gameRouter.put("/:id", validateExists, sanitizeInput, update);
gameRouter.patch("/:id", validateExists, sanitizeInput, update);
gameRouter.delete("/:id", validateExists, remove);
