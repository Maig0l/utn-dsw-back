import { Router } from "express";
import {
  addPicture,
  removePicture,
  sanitizeInput,
  validateExists,
} from "./game-picture.controller.js";

export const gamePictureRouter = Router();

gamePictureRouter.post("/", sanitizeInput, addPicture);
gamePictureRouter.delete("/:id", validateExists, sanitizeInput, removePicture);
