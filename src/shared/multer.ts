import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { ulid } from "ulid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar la carpeta de uploads usando variable de entorno o valor por defecto
const UPLOADS_PATH = process.env.UPLOADS_PATH || "uploads";

// Asegurar que la carpeta de uploads existe
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

// Configurar el almacenamiento de multer
const storageBase = multer.diskStorage({
  destination: UPLOADS_PATH,
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
  isValid ? cb(null, true) : cb(new Error("Only image files are allowed."));
};

// Middleware de subida
export const upload = multer({
  storage: storageBase,
  fileFilter: filterImageTypes,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Exportar la ruta de uploads para usar en otros archivos
export { UPLOADS_PATH };
