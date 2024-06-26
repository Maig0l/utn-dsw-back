import express, {Request} from 'express' 
import {Shop} from './shop/shop.entity.js'
import path from 'path'
import { fileURLToPath } from 'url';

// Metadatos para saber en qué directorio está el programa
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// La raíz del proyecto es uno arriba pues pnpm ejecuta el app.js dentro de la carpeta dist/
const ROOT = path.join(__dirname, '..')
const app = express()

// Tenemos que usar el middleware url-encoded extendido porque Express
//  no me toma el body de la request POST si tiene Content-Type:application/form-data
// Nota: En Postman usar body de tipo x-www-form-urlencoded
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))


app.get('/', (req, res) => {
  res.sendFile("index.html", {root: ROOT})
})

app.listen(8080, ()=> {
  console.log(`running on http://localhost:8080
root in ${ROOT}`)
})