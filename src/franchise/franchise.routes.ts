import { Router } from "express";
import {findAll, findOne, add, update, remove, sanitizeFranchiseInput, validateExists} from "./franchise.controller.js";


export const franchiseRouter = Router();

franchiseRouter.get("/", findAll);
franchiseRouter.post("/", sanitizeFranchiseInput, add);

franchiseRouter.get("/:id", validateExists, findOne);
franchiseRouter.put("/:id", validateExists, sanitizeFranchiseInput, update);
franchiseRouter.patch("/:id", validateExists, sanitizeFranchiseInput, update);
franchiseRouter.delete("/:id", validateExists, remove);
