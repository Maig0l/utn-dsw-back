import { app } from "./app.js";

const APP_PORT = process.env.port || 8080;

// Necesitamos separar el módulo que configura la app de Express, del módulo que
//   inicia el servidor (lo activa en un puerto) para que la suite de testing
//   pueda importarla y usarla correctamente
app.listen(APP_PORT, () => {
  console.log(`Running on http://localhost:8080`);
});
