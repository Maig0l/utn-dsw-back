import express, {NextFunction, Request} from 'express'
import {Shop} from './Shop.js'
import { Platform } from './platform.js';
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
    if (!reqHasParams(req, ["name", "img", "site"])) {
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
  .all((req: Request, res, next) => {
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

    /** NOTA
     * El objeto respuesta `res` tiene un objeto `res.locals` donde podemos guardar datos que nos interesen.
     * Cuando el `.all` le pase el control al `.get` o `.post` (mediante el callback `next`), estos últimos tendrán
     * acceso a las variables guardadas en `res.locals`, ya que están procesando la misma request y la misma response.
     * Esto lo hacemos para no tener que, en los demás callbacks, no tengamos que volver a buscar la shop
     * con shops.find() como lo hicimos en la línea 55.
     */
    res.locals.idxShop = idxShop;
    res.locals.shop = shops[idxShop];
    next()
  })

  .get((req: Request, res) => {
    res.json(res.locals.shop)
  })

  .delete((req: Request, res) => {
    res.send(res.locals.shop)
    shops.splice(res.locals.idxShop, 1);
  })

  .patch((req, res) => {
    // Se ejecuta si la request tiene algun parámetro válido, actualizará ese
    //  y descartará el resto

    /** CONSULTA
     * Es necesario o no escribir los tipos req: Request, res: Response?
     */
    const VALID_PARAMS = ["name", "img", "site"]
    if (!reqHasSomeParams(req, VALID_PARAMS)) {
      res.status(400).send("Request must provide at least 1 valid parameter")
      return
    }

    // TODO: Debe haber una mejor forma de hacer esto...
    // Traemos el objeto shop de las variables locales de la request para no escribir res.locals cada vez (conveniencia)
    const shop = res.locals.shop;
    VALID_PARAMS.forEach( (field) => {
      const newValue = req.body[field];
      if (newValue === undefined) return;

      switch (field) {
        case "name": shop.setName(newValue); break;
        case "img": shop.setImg(newValue); break;
        case "site": shop.setSite(newValue); break;
      }
    })
    res.send(shop)
  })

app.get('/', (req, res) => {
  res.sendFile("index.html", {root: ROOT})
})

app.listen(8080, ()=> {
  console.log(`running on http://localhost:8080
root in ${ROOT}`)
})

function reqHasParams(req: Request, params: string[]): Boolean {
  return params.every( (e) => {
    return Object.keys(req.body).includes(e)
  })
}

function reqHasSomeParams(req: Request, params: string[]): Boolean {
  return params.some( (e) => {
    return Object.keys(req.body).includes(e)
  })
}










//CRUD Platform
/*
function sanitizePlatformInput(req:Request, res:Response, next:NextFunction){
  req.body.sanitizedInput = {
    name: req.body.name,
    img: req.body.img
  }
  next()
}
*/

const platforms: Platform[] = [];
platforms.push(new Platform("Play Station 1", "/assets/ps1.svg"))
platforms.push(new Platform("Play Station 2", "/assets/ps2.svg"))

//list all platforms
app.get('/api/platforms', (req,res)=> {
  res.json({data: platforms}) 
})

//show one platform
app.get('/api/platforms/:id', (req ,res)=> {
  const platform = platforms.find((platform)=> platform.getId()===Number.parseInt(req.params.id))
  if(!platform){
    res.status(404).send({message: 'Platform not found'})
  }
  res.json({data: platform})
})


//set a new platform SIN SANITIZAR. me pide parametros en el middleware
app.post('/api/platforms', (req,res) => {
    if (!reqHasParams(req, ["name", "img"])) {
      res.sendStatus(400)
    }
    const { name , img } = req.body
    const platform =  new Platform (name,img)
    platforms.push(platform)
    res.status(201).send({message: 'Platform created', data: platform})
} )


//update a platform SIN SANITIZAR
app.put('/api/platforms/:id', (req ,res)=>{
  const platformIdx = platforms.findIndex((platform) => platform.getId() === Number.parseInt(req.params.id) )
  if(platformIdx===-1){
    res.status(404).send({message: 'platform not found'})
  }
  const { name , img } = req.body
  platforms[platformIdx] = {...platforms[platformIdx], ... req.body }
  res.status(200).send({message: 'plaform updated succesfully', data: platforms[platformIdx]})
})

