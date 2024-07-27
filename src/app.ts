import 'reflect-metadata'
import express from 'express' 
import { platformRouter } from './platform/platform.routes.js';
import { shopRouter } from './shop/shop.routes.js';
import { studioRouter } from './studio/studio.routes.js';
import { userRouter } from './user/user.routes.js';
import { tagRouter } from './tag/tag.routes.js'
import { orm, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
// TODO: Cargar configuraciones desde .env (con dotenv), o generar archivo .env
//        con las variables válidas en caso de no existir

export const app = express()

// Tenemos que usar el middleware url-encoded extendido porque Express
//  no me toma el body de la request POST si tiene Content-Type:application/form-data
// Nota: En Postman usar body de tipo x-www-form-urlencoded
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

// Registrar routers para entidades
app.use('/api/users', userRouter)
app.use('/api/shops', shopRouter)
app.use('/api/studios', studioRouter)
app.use('/api/platforms', platformRouter)
app.use('/api/tags', tagRouter)

await syncSchema() // TODO: Never in prod

app.use((_, res) => {
  return res.status(404).json({message: "Resource not found"})
})
