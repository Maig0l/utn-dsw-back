import {NextFunction, Request, Response} from 'express'
import { PlatformRepository } from './platform.repository.js'
import { Platform } from './platform.entity.js'


const repository = new PlatformRepository()


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
  res.json({data: repository.findAll()}) 
}


function findOne(req: Request ,res:Response) {
  const platform = repository.findOne({id : Number.parseInt(req.params.id)})
  if(!platform){
    return res.status(404).send({message: 'Platform not found.'})
  }
  res.json({data: platform})
}


function add(req:Request,res:Response) {
    const { name , img } = req.body.sanitizedInput
    const platform =  new Platform (name,img)
    const plat = repository.add(platform)
    return res.status(201).send({message: 'Platform created.', data: plat})
}


function update (req:Request,res:Response) {
  req.body.sanitizedInput.id= req.params.id
  const platform = repository.update(req.body.sanitizedInput)
  if(!platform){
    return res.status(404).send({message: 'Platform not found.'})
  }
  return res.status(200).send({message: 'Plaform updated succesfully.', data: platform})
}


function remove (req:Request,res:Response) {
  const platform = repository.remove({id:  Number.parseInt(req.params.id)})
  if(!platform){
    res.status(404).send({message: 'Platform not found.'})
  } else {
    res.status(200).send({message: 'Platform deleted succesfully.'})
  }
}


export {sanitizePlatformInput, findAll, findOne, add, update, remove}