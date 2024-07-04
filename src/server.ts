import { app } from "./app.js"

// Necesitamos separar el módulo que configura la app de Express, del módulo que
//   inicia el servidor (lo activa en un puerto) para que la suite de testing
//   pueda importarla y usarla correctamente
app.listen(8080, ()=> {
  console.log(`Running on http://localhost:8080`)
})