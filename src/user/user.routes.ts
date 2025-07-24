import { Router } from "express";
import {
  add,
  findAll,
  findOne,
  findOneByNick,
  remove,
  sanitizeInput,
  update,
  validateExists,
  login,
  changeProfilePicture,
  setAdminStatus,
} from "./user.controller.js";
import { upload } from "../shared/multer.js";
import { listReviewsByAuthor } from "../review/review.controller.js";
import { getAndSaveUserObjectsToResponseLocals, isAdminGuard } from "../auth/auth.middleware.js";

export const userRouter = Router();

userRouter.get("/", findAll);
userRouter.post("/", sanitizeInput, add);
userRouter.post("/login", sanitizeInput, login); // TODO: Move to an /auth endpoint

// No hace falta aclarar el nick o id del usuario
userRouter.patch("/me/profile_img", upload.single('profile_img'), changeProfilePicture);

userRouter.get("/:nick", findOneByNick);
userRouter.get("/:nick/reviews", listReviewsByAuthor);

userRouter.patch("/:nick/setAdminStatus", getAndSaveUserObjectsToResponseLocals, isAdminGuard, setAdminStatus);

// Todas las rutas /:id usan el validateExists
userRouter.use("/:id", validateExists);

userRouter.get("/:id", findOne);
userRouter.put("/:id", sanitizeInput, update);
userRouter.patch("/:id", sanitizeInput, update);
userRouter.delete("/:id", remove);

/// (Deprecado)
// userRouter.patch(
//   "/:id(\\d+)/uploads/profile_img",
//   validateExists,
//   upload.single("profile_img"),
//   uploadImg,
// );
