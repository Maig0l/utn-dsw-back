import { Router } from "express";
import {findAll, findOne, add, update, remove, sanitizeInput, validateExists} from "./franchise.controller.js";


export const franchiseRouter = Router();

franchiseRouter.get("/", findAll);
franchiseRouter.post("/", sanitizeInput, add);

franchiseRouter.get("/:id", validateExists, findOne);
franchiseRouter.put("/:id", validateExists, sanitizeInput, update);
franchiseRouter.patch("/:id", validateExists, sanitizeInput, update);
franchiseRouter.delete("/:id", validateExists, remove);
