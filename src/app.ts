import fs from 'fs';
import express from 'express' 
import path from 'path'
import { fileURLToPath } from 'url';
import { platformRouter } from './platform/platform.routes.js';
import { shopRouter } from './shop/shop.routes.js';
import { studioRouter } from './studio/studio.routes.js';
import { userRouter } from './user/user.routes.js';

const app = express()

// Tenemos que usar el middleware url-encoded extendido porque Express
//  no me toma el body de la request POST si tiene Content-Type:application/form-data
// Nota: En Postman usar body de tipo x-www-form-urlencoded
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Registrar routers para entidades
app.use('/api/users', userRouter)
app.use('/api/shops', shopRouter)
app.use('/api/studios', studioRouter)
app.use('/api/platforms', platformRouter)

app.use((_, res) => {
  return res.status(404).json({message: "Resource not found"})
})

app.listen(8080, ()=> {
  console.log(`Running on http://localhost:8080`)
})
