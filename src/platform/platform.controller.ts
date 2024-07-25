import {NextFunction, Request, Response} from 'express'
//import { PlatformRepository } from './platform.repository.js'
import { Platform } from './platform.entity.js'


//const repository = new PlatformRepository()


function sanitizePlatformInput(req:Request, res:Response, next:NextFunction){
  req.body.sanitizedInput = {
    name: req.body.name,
    img: req.body.img
  }
  Object.keys(req.body.sanitizedInput).forEach((key)=>{
    if(req.body.sanitizedInput[key]=== undefined) 
      delete req.body.sanitizedInput[key]
  })
  next()
}


function findAll(req: Request,res: Response) {
  res.status(500).json({message: 'Not implemented'}) 
}


function findOne(req: Request ,res:Response) {
  res.status(500).json({message: 'Not implemented'}) 
}


function add(req:Request,res:Response) {
    res.status(500).json({message: 'Not implemented'}) 
}


function update (req:Request,res:Response) {
  res.status(500).json({message: 'Not implemented'}) 
}


function remove (req:Request,res:Response) {
  res.status(500).json({message: 'Not implemented'}) 
  }


export {sanitizePlatformInput, findAll, findOne, add, update, remove}