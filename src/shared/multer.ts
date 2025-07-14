import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { ulid } from "ulid";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Configurar el almacenamiento de multer
const storageBase = multer.diskStorage({
  destination: "uploads",
  filename: function (req, file, cb) {
    cb(null, ulid() + path.extname(file.originalname)); // Renombrar archivo
  },
});

// Filtro para aceptar solo imágenes
const filterImageTypes = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const isValid =
    allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);
  isValid ? cb(null, true) : cb(new Error("Solo se permiten imágenes"));
};

// Middleware de subida
export const upload = multer({
  storage: storageBase,
  fileFilter: filterImageTypes,
  limits: { fileSize: 5 * 1024 * 1024 },
});
