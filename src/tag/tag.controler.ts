import { Request, Response, NextFunction } from 'express'
import { TagRepository } from './tag.repository.js'
import { Tag } from './tag.entity.js'

const repository = new TagRepository()

function sanitizeTagInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description
    
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
   /* if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }*/
  })
  next()
}

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  const id:number = parseInt(req.params.id)
  const tag = repository.getOne({id })
  if (!tag) {
    return res.status(404).send({ message: 'Tag not found' })
  }
  res.json({ data: tag })
}

function add(req: Request, res: Response) {
  const { name , description} = req.body.sanitizedInput

  const tagInput = new Tag(name, description)

  const tag = repository.add(tagInput)
  return res.status(201).send({ message: 'Tag created', data: tag })
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const tag = repository.update(req.body.sanitizedInput)

  if (!tag) {
    return res.status(404).send({ message: 'Tag not found' })
  }

  return res.status(200).send({ message: 'Tag updated successfully', data: tag })
}

function remove(req: Request, res: Response) {
  const id:number = parseInt(req.params.id)
  const tag = repository.delete({ id })

  if (!tag) {
    res.status(404).send({ message: 'Tag not found' })
  } else {
    res.status(200).send({ message: 'Tag deleted successfully' })
  }
}

export { sanitizeTagInput, findAll, findOne, add, update, remove }