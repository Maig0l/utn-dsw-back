import { Request, Response, NextFunction } from "express"
import { Studio } from "./studio.entity.js";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";
import { orm } from "../shared/db/orm.js";

const validParams = "name type site".split(' ')
const hasParams = paramCheckFromList(validParams)

const em = orm.em

async function findAll(req: Request, res: Response) {
    try {
        const studios = await em.find(Studio, {})
        res.json({data: studios})
    } catch (err) {
        handleOrmError(res, err)
    }
}

async function findOne(req: Request, res: Response) {
    try {
      const studio = await em.findOneOrFail(Studio, {id: res.locals.id})
      res.json({data: studio})
    } catch(err) {
      handleOrmError(res, err)
    }
  }

async function add(req: Request, res: Response) {
    try {
        const studio = em.create(Studio, res.locals.sanitizedInput)
        await em.flush()
        res.status(201).json({message: "Studio created successfully", data: studio})
    } catch(err) {
        handleOrmError(res, err)
    }
}

async function update(req: Request, res: Response) {
    try {
        const studio = await em.findOneOrFail(Studio, {id: res.locals.id})
        em.assign(studio, res.locals.sanitizedInput)
        await em.flush()
        res.json({message: "Studio updated", data: studio})
    } catch(err) {
        handleOrmError(res, err)
    }
}

async function remove(req: Request, res: Response) {
    try {
        const studio = await em.findOneOrFail(Studio, {id: res.locals.id})
        const studioRef = em.getReference(Studio, res.locals.id)
        await em.removeAndFlush(studioRef)

        res.json({message: "Studio deleted successfully", data: studio})
    }   catch(err) {
        handleOrmError(res, err)
    }
}

//middleware

function sanitizeInput(req:Request, res:Response, next:NextFunction) {

    if (["POST", "PUT"].includes(req.method) && !hasParams(req.body, true))
        return res.status(400)
            .json({message: "Must provide all attributes"})

    if ("PATCH" == req.method && !hasParams(req.body, false))
        return res.status(400)
            .json({message: "Must provide at least one valid attribute"})
          

    res.locals.sanitizedInput = {
        name: req.body.name,
        type: req.body.type,
        site: req.body.site
    }

    const sanitizedInput = res.locals.sanitizedInput
    
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    if(!urlRegex.test(req.body.site))
        sanitizedInput.site = undefined

    if (!urlRegex.test(req.body.site))
        sanitizedInput.site = undefined
    

    Object.keys(sanitizedInput).forEach((key) => {
        if (sanitizedInput[key] === undefined) {
            delete sanitizedInput[key];
        }
    });
    
    next();
}

// santizacion del tipo

function validateExists(req:Request, res:Response, next:NextFunction) {
    const id = parseInt(req.params.id);

    if (Number.isNaN(id))
        return res.status(400).json({ message: "ID must be an integer" })

    // const studio = Repository.findOne({ id });

    // if (!studio) 
    //    return res.status(404).json({ message: "Studio Not Found with the selected ID" });

    res.locals.id = id
     //res.locals.studio = studio

    next();
}

function handleOrmError(res: Response, err: any) {
    if (err.code) {
      switch (err.code) {
        case "ER_DUP_ENTRY":
          // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
          res.status(400).json({message: `A studio with that name/site already exists.`})
          break
        case "ER_DATA_TOO_LONG":
          res.status(400).json({message: `Data too long.`})
          break
      }
    }
    else {
      switch (err.name) {
        case "NotFoundError":
          res.status(404).json({message: `Studio not found for ID ${res.locals.id}`})
          break
        default:
          console.error("\n--- ORM ERROR ---")
          console.error(err.message)
          res.status(500).json({message: "Oops! Something went wrong. This is our fault."})
          break
      }
    }
  }
    
export { findAll, findOne, add, update, remove, sanitizeInput, validateExists };