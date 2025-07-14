import { Router } from "express";
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeInput,
  sanitizePartialInput,
  validateExists,
  findFranchisesByName,
} from "./franchise.controller.js";

export const franchiseRouter = Router();

franchiseRouter.get("/search", findFranchisesByName);
franchiseRouter.get("/", findAll);
franchiseRouter.post("/", sanitizeInput, add);

franchiseRouter.get("/:id(\\d+)", validateExists, findOne);
franchiseRouter.put("/:id(\\d+)", validateExists, sanitizeInput, update);
franchiseRouter.patch(
  "/:id(\\d+)",
  validateExists,
  sanitizePartialInput,
  update,
);
franchiseRouter.delete("/:id(\\d+)", validateExists, remove);
