import express, {Request} from 'express'
import {Shop} from './Shop.js'
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

const shops: Shop[] = [];
shops.push(new Shop("Steam", "/assets/steam.svg", "https://steampowered.com/"))
shops.push(new Shop("Epic Games", "/assets/epic.svg", "https://store.epicgames.com/"))
shops.push(new Shop("PSN Store", "/assets/psn.svg", "https://store.playstation.com/"))

/** CONSULTA
 * Cómo separo mi código de ruteo?
 * Para no tener TODOS los CRUD en un mismo archivo app.ts
 */

app.route("/api/shops")
  .get((req, res) => { res.json(shops) })

  .post((req: Request, res) => {
    /** CONSULTA
     * req.params() está deprecado, pero qué debería hacer?
     * Para el POST siempre se usa el body de la request? (Creo que sí)
     */

    /** NOTA
     * Da igual si uso req.body.name o req.body['name'] pues ambos dan undefined
     *  si no existe el parámetro
     */
    if (!reqHasParams(req, "name img site".split(" "))) {
      res.sendStatus(400)
    }

    const x = shops.push(
      new Shop(req.body.name,
              req.body.img,
              req.body.site)
    );
    res.json(shops[x-1])
  })

app.route("/api/shops/:id")
  .all((req: Request, res) => {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).send("ID must be an integer.");
      return
    }

    const idxShop = shops.findIndex((e)=>{return e.getId() === id});
    if (idxShop === -1) {
      res.sendStatus(404);
      return
    }
  })

  .get((req: Request, res) => {
    const id = Number.parseInt(req.params.id);
    const shop = shops.find((e) => { return e.getId() === id })
    res.json(shop)
  })

  .delete((req: Request, res) => {
    /** NOTA
     * Luego de un res.send(), corresponde un return para cerrar el callback.
     * Especificamente si estoy usando guard clauses
     */
    const id = Number.parseInt(req.params.id);
    const idxShop = shops.findIndex((e) => { return e.getId() === id })

    const shop = shops[idxShop];
    res.send(shop)
    shops.splice(idxShop, 1);
  })

  .patch((req, res) => {
    // Se ejecuta si la request tiene algun parámetro válido, actualizará ese
    //  y descartará el resto
    /** CONSULTA
     * Es necesario o no escribir los tipos req: Request, res: Response?
     */
    const id = Number.parseInt(req.params.id);
    const idxShop = shops.findIndex((e) => { return e.getId() === id })

    const VALID_PARAMS = ["name", "img", "site"]
    if (!reqHasSomeParams(req, VALID_PARAMS)) {
      res.status(400).send("Request must provide at least 1 valid parameter")
      return
    }

    const shop = shops[idxShop];
    VALID_PARAMS.forEach( (field) => {
      const newVal = req.body[field];
      if (newVal === undefined) return;
      switch (field) {
        case "name": shop.setName(newVal); break;
        case "img": shop.setImg(newVal); break;
        case "site": shop.setSite(newVal); break;
      }
    })
    res.send(shop)
  })

// Responder a la ruta / con la callback
app.get('/', (req, res) => {
  res.sendFile("index.html", {root: ROOT})
})

app.listen(8080, ()=> {
  console.log(`running on http://localhost:8080
root in ${ROOT}`)
})

function reqHasParams(req: Request, params: string[]) {
  return params.every( (e) => {
    return Object.keys(req.body).includes(e)
  })
}

function reqHasSomeParams(req: Request, params: string[]) {
  return params.some( (e) => {
    return Object.keys(req.body).includes(e)
  })
}