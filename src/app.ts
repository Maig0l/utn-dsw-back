import "reflect-metadata";
import express from "express";
import { platformRouter } from "./platform/platform.routes.js";
import { shopRouter } from "./shop/shop.routes.js";
import { studioRouter } from "./studio/studio.routes.js";
import { userRouter } from "./user/user.routes.js";
import { tagRouter } from "./tag/tag.routes.js";
import { franchiseRouter } from "./franchise/franchise.routes.js";
import { gameRouter } from "./game/game.routes.js";
import { playlistRouter } from "./playlist/playlist.routes.js";
import { orm, syncSchema } from "./shared/db/orm.js";
import { RequestContext } from "@mikro-orm/core";
import cors from "cors";
import { reviewRouter } from "./review/review.routes.js";
import { gamePictureRouter } from "./game-picture/game-picture.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { initializeAdminUserIfAbsent } from "./user/user.init.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Tenemos que usar el middleware url-encoded extendido porque Express
//  no me toma el body de la request POST si tiene Content-Type:application/form-data
// Nota: En Postman usar body de tipo x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// TODO: Configurar por seguridad
app.use(cors());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

// Registrar routers para entidades
app.use("/api/users", userRouter);
app.use("/api/users/:id(\\d+)/uploads", express.static("uploads")); // TODO: Cambiar a un bucket de S3 o similar
app.use("/api/shops", shopRouter);
app.use("/api/studios", studioRouter);
app.use("/api/franchises", franchiseRouter);
app.use("/api/platforms", platformRouter);
app.use("/api/tags", tagRouter);
app.use("/api/games", gameRouter);
app.use("/api/games/:id(\\d+)/uploads", express.static("uploads")); // TODO: Cambiar a un bucket de S3 o similar
app.use("/api/playlists", playlistRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/game-picture", gamePictureRouter);
app.use("/uploads", express.static(path.join(__dirname, "../../uploads"))); // Usamos este path porque el server se ejecuta desde la carpeta /src

await syncSchema(); // TODO: Never in prod
await initializeAdminUserIfAbsent();

app.use((_, res) => {
  return res.status(404).json({ message: "Resource not found" });
});
