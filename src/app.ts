import fs from 'fs';
import express, {NextFunction, Request, Response} from 'express' 
import {Shop} from './shop/shop.entity.js'
import { Platform } from './platform.js';
import path from 'path'
import { fileURLToPath } from 'url';
import { shopRouter } from './shop/shop.routes.js';

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
app.use(express.json())
app.use(express.static("public"))

// Registrar routers para entidades
app.use('/api/shops', shopRouter)

// Index para debug
app.get('/', (req, res) => {
  res.sendFile("index.html", {root: ROOT})
})

app.post('/restart', (req, res) => {
  console.log("Restarting server...")
  res.json({message: "Restarting server..."})
  fs.writeFileSync("src/restart.ts", `const x = "${new Date().toISOString()}"`)
})

app.use((_, res) => {
  return res.status(404).json({message: "Resource not found"})
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


// Para manejar URL que no existe
app.use((_,res)=>{
  return res.status(404).send({message: 'Resource not found.'})
})