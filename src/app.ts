import express, {Request} from 'express'
import { tagRouter } from './tag/tag.routes.js'
import path from 'path'
import { fileURLToPath } from 'url';

// Metadatos para saber en qué directorio está el programa
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// La raíz del proyecto es uno arriba pues pnpm ejecuta el app.js dentro de la carpeta dist/
const ROOT = path.join(__dirname, '..')
const app = express()



app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))



app.use('/api/tags', tagRouter)


app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})






app.listen(8080, ()=> {
  console.log(`running on http://localhost:8080
root in ${ROOT}`)
})
