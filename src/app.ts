import express, {NextFunction, Request, Response} from 'express'
import {Shop} from './Shop.js'
import { Platform } from './platform.js';
import {Studio} from './studio.js'
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

function sanitizePlatformInput(req:Request, res:Response, next:NextFunction){
  req.body.sanitizedInput = {
    name: req.body.name,
    img: req.body.img
  }
  Object.keys(req.body.sanitizedInput).forEach(key=>{
    if(req.body.sanitizedInput[key]=== undefined) 
      delete req.body.sanitizedInput[key]
  })
  next()
}


const platforms: Platform[] = [];
platforms.push(new Platform("Play Station 1", "/assets/ps1.svg"))
platforms.push(new Platform("Play Station 2", "/assets/ps2.svg"))


app.route("/api/platforms")
  .get((req,res)=> {
  res.json({data: platforms}) 
})


  .post(sanitizePlatformInput, (req,res) => {
    const { name , img } = req.body
    const platform =  new Platform (name,img)
    platforms.push(platform)
    return res.status(201).send({message: 'Platform created.', data: platform})
} )


app.route("/api/platforms/:id")
  .get((req ,res)=> {
  const platform = platforms.find((platform)=> platform.getId()===Number.parseInt(req.params.id))
  if(!platform){
    return res.status(404).send({message: 'Platform not found.'})
  }
  res.json({data: platform})
})


.put(sanitizePlatformInput, (req ,res)=>{
  const platformIdx = platforms.findIndex((platform) => platform.getId() === Number.parseInt(req.params.id))
  if(platformIdx===-1){
    return res.status(404).send({message: 'Platform not found.'})
  }
  Object.assign(platforms[platformIdx],req.body.sanitizedInput)
  return res.status(200).send({message: 'Plaform updated succesfully.', data: platforms[platformIdx]})
})


.patch(sanitizePlatformInput, (req ,res)=>{
  const platformIdx = platforms.findIndex((platform) => platform.getId() === Number.parseInt(req.params.id))
  if(platformIdx===-1){
    return res.status(404).send({message: 'Platform not found.'})
  }
  Object.assign(platforms[platformIdx],req.body.sanitizedInput)
  return res.status(200).send({message: 'Plaform updated succesfully.', data: platforms[platformIdx]})
})


.delete((req,res)=>{
  const platformIdx = platforms.findIndex((platform) => platform.getId() === Number.parseInt(req.params.id))
  if(platformIdx===-1){
    res.status(404).send({message: 'Platform not found.'})
  } else {
    res.status(200).send({data: platforms[platformIdx],message: 'Platform deleted succesfully.'})
    platforms.splice(platformIdx,1)
  }
})

//CRUD Studio

function sanitizeStudioInput(req:Request, res:Response, next:NextFunction){
  req.body.sanitizedInput = {
    name: req.body.name,
    type: req.body.type,
    site: req.body.site
  }
  Object.keys(req.body.sanitizedInput).forEach(key=>{
    if(req.body.sanitizedInput[key]=== undefined) 
      delete req.body.sanitizedInput[key]
  })
  next()
}

app.route ("/api/studios") //aca es donde se genera la vista de los estudios
  
.get((req,res)=> { res.json(studios)})

.post((req: Request, res) => {                           
  if (!reqHasParams(req, ["name", "type", "site"])) {
    res.sendStatus(400)
  } 

  const x = studios.push(
    new Studio(req.body.name,
            req.body.type,
            req.body.site)
  );
  res.json(studios[x-1])
})

app.route("/api/studios/:id")
  .all((req: Request, res, next) => {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).send("ID must be an integer.");
      return
    }

    const idxStudio = studios.findIndex((e)=>{return e.getId() === id});
    if (idxStudio === -1) {
      res.sendStatus(404);
      return
    }

    res.locals.idxStudio = idxStudio;
    res.locals.studio = studios[idxStudio];
    next()
  })

  .get((req: Request, res) => {
    res.json(res.locals.studio)
  })

  .delete((req: Request, res) => {
    res.send(res.locals.studio)
    studios.splice(res.locals.idxStudio, 1);
  })

  .patch((req, res) => {
    const VALID_PARAMS = ["name", "type", "site"]
    if (!reqHasSomeParams(req, VALID_PARAMS)) {
      res.status(400).send("Request must provide at least 1 valid parameter")
      return
    }

    const studio = res.locals.studio;
    VALID_PARAMS.forEach( (field) => {
      const newValue = req.body[field];
      if (newValue === undefined) return;

      switch (field) {
        case "name": studio.setName(newValue); break;
        case "type": studio.setType(newValue); break;
        case "site": studio.setSite(newValue); break;
      }
    })
    res.send(studio)
  })

const studios: Studio[] = [];
studios.push(new Studio("ATLUS",["Desarrollador"],"https://atlus.com/"))
studios.push(new Studio("WSS Playground",["Desarrollador", "Editor"],"https://whysoserious.jp/en/"))
studios.push(new Studio("Square Enix",["Desarrollador", "Editor"],"https://www.square-enix-games.com/es_XL/home"))

app.route("/api/studios")
  .get((req,res)=> {
  res.json({data: Studio}) 
})

  .post(sanitizeStudioInput, (req,res) => {
    const { name , type, site } = req.body
    const studio =  new Studio (name,type,site)
    studios.push(studio)
    return res.status(201).send({message: 'Studio created.', data: studio})
} )

app.route("/api/studios/:id")
  .get((req ,res)=> {
  const studio = studios.find((studio)=> studio.getId()===Number.parseInt(req.params.id))
  if(!studio){
    return res.status(404).send({message: 'Studio not found.'})
  }
  res.json({data: studio})
})

.put(sanitizeStudioInput, (req ,res)=>{
  const studioIdx = studios.findIndex((studio) => studio.getId() === Number.parseInt(req.params.id))
  if(studioIdx===-1){
    return res.status(404).send({message: 'Studio not found.'})
  }
  Object.assign(studios[studioIdx],req.body.sanitizedInput)
  return res.status(200).send({message: 'Studio updated succesfully.', data: studios[studioIdx]})
})

.patch(sanitizeStudioInput, (req ,res)=>{
  const VALID_PARAMS = ["name", "type", "site"]
  const studioIdx = studios.findIndex((studio) => studio.getId() === Number.parseInt(req.params.id))
  if(!reqHasSomeParams(req, VALID_PARAMS)){
    return res.status(400).send({message: 'Request must provide at least 1 valid parameter.'})
  }
  if(studioIdx===-1){
    return res.status(404).send({message: 'Studio not found.'})
  }
  Object.assign(studios[studioIdx],req.body.sanitizedInput)
  return res.status(200).send({message: 'Studio updated succesfully.', data: studios[studioIdx]})
})

.delete((req,res)=>{
  const studioIdx = studios.findIndex((studio) => studio.getId() === Number.parseInt(req.params.id))
  if(studioIdx===-1){
    res.status(404).send({message: 'Studio not found.'})
  } else {
    res.status(200).send({data: studios[studioIdx],message: 'Studio deleted succesfully.'})
    studios.splice(studioIdx,1)
  }
})



// Para manejar URL que no existe
app.use((_,res)=>{
  return res.status(404).send({message: 'Resource not found.'})
})