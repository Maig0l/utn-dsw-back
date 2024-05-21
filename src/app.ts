import express from 'express'
import {Shop} from './Shop.js'

const app = express()

const shops: Shop[] = [];
shops.push(new Shop("Steam", "/assets/steam.svg", "https://steampowered.com/"))
shops.push(new Shop("Epic Games", "/assets/epic.svg", "https://store.epicgames.com/"))
shops.push(new Shop("PSN Store", "/assets/psn.svg", "https://store.playstation.com/"))

app.get("/api/shops", (req, res) => {
  res.json(shops)
})


// Responder a la ruta / con la callback
app.use('/', (req, res) => {
  res.send(`Entidad: Tienda <br/>
  <ul>
    <li><a href="/api/shops">GET tiendas</a> (precargadas y hardcodeadas)</li>
  </ul>`)
})

app.listen(8080, ()=> {
  console.log(`running on http://localhost:8080`)
})