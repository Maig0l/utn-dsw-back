import { Request, Response, NextFunction } from 'express'

import { Franchise } from './franchise.entity.js'
import { orm } from "../shared/db/orm.js";
import { paramCheckFromList } from '../shared/paramCheckFromList.js';


const VALID_PARAMS = "name description".split(' ')
const hasParams = paramCheckFromList(VALID_PARAMS)
const em = orm.em


function sanitizeFranchiseInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
  }
  Object.keys(req.body.sanitizedInput).forEach((key)=>{
    if(req.body.sanitizedInput[key]=== undefined) 
      delete req.body.sanitizedInput[key]
  })
  next()
}



async function findAll(req: Request,res: Response) {
  try{
    const franchises = await em.find(Franchise, {})
    res.json({data: franchises})
    } catch (err) {
        handleOrmError(res, err)
    }
}



async function findOne(req: Request ,res:Response) {
  try{
    const franchise = await em.findOneOrFail(Franchise, {id: res.locals.id})
    res.json({data: franchise})
  } catch(err) {
    handleOrmError(res, err)
  }
}


async function add(req:Request,res:Response) {
  try{
    const franchise = em.create(Franchise, req.body)
    await em.flush()
    res.status(201).json({message: 'Franchise created', data: franchise})
  }  catch  (error: any){
    res.status(500).json({message: error.message})
  }  
}

async function update (req:Request,res:Response) {
  try{
    const id = Number.parseInt(res.locals.id)
    const franchise = em.getReference(Franchise, id)
    em.assign(franchise, req.body)
    await em.flush()
    res.status(200).json({message: 'Franchise updated', data: franchise})
  }  catch  (error: any){
    res.status(500).json({message: error.message})
  }   
}

async function remove (req:Request,res:Response) {
  try{
    const franchise = await em.findOneOrFail(Franchise, {id: res.locals.id})
    const franchiseRef = em.getReference(Franchise, res.locals.id) 
    await em.removeAndFlush(franchiseRef)

    res.json({message: "Franchise deleted successfully", data: franchise})
  } catch(err) {
    handleOrmError(res, err)
  }
  }

  function validateExists(req:Request, res:Response, next: NextFunction) {
    const id = Number.parseInt(req.params.id)
  
    if (Number.isNaN(id))
      return res.status(400).json({message: 'ID must be an integer'})
  
   
  
    res.locals.id = id

    next()
  }





function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case "ER_DUP_ENTRY":
        // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
        res.status(400).json({message: `A tag with that name/site already exists.`})
        break
      case "ER_DATA_TOO_LONG":
        res.status(400).json({message: `Data too long.`})
        break
    }
  }
  else {
    switch (err.name) {
      case "NotFoundError":
        res.status(404).json({message: `franchise not found for ID ${res.locals.id}`})
        break
      default:
        console.error("\n--- ORM ERROR ---")
        console.error(err.message)
        res.status(500).json({message: "Oops! Something went wrong. This is our fault."})
        break
    }
  }
}

export { sanitizeFranchiseInput, findAll, findOne, add, update, remove, validateExists }