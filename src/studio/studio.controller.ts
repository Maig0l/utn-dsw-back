import { Request, Response, NextFunction } from "express"
import { StudioRepository } from "./studio.repository.js"
import { paramCheckFromList } from "../shared/paramCheckFromList.js";

const validParams = ['name', 'type', 'site']
const hasParams = paramCheckFromList(validParams)

const Repository = new StudioRepository();

function findAll(req: Request, res: Response) {
    const studios = Repository.findAll();
    if (!studios) {
        return res.status(404).json({ message: "Studio Not Found" });
    }
    res.json({data: studios});
}

function findOne(req: Request, res: Response) {
    const studio = Repository.findOne({ id: parseInt(req.params.id) });
    if (!studio) {
        return res.status(404).json({ message: "Studio Not Found" });
    }
    res.json({data: studio});
}

function add(req: Request, res: Response) {
    const studio = Repository.add(req.body);
    if (!studio) {
        return res.status(500).json({message: "Add new Studio failed"})
    }
    res.status(201).json({data: studio})
}

function update(req: Request, res: Response) {
    const newData = {...res.locals.sanitizedInput, id: res.locals.id}
    
    const studio = Repository.update(newData);
    if (!studio) {
        return res.status(500).json({message: "Update Studio failed"})
    }
    res.json({data: studio});
}

function remove(req: Request, res: Response) {
    const studio = Repository.remove({ id: parseInt(req.params.id) });
    if (!studio) {
        return res.status(404).json({ message: "Studio Not Found, so no deleted" });
    }
    res.status(200).json({data: studio});
}

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

    const studio = Repository.findOne({ id });

    if (!studio) 
        return res.status(404).json({ message: "Studio Not Found with the selected ID" });

    res.locals.id = id
    res.locals.studio = studio

    next();
}
    
export { findAll, findOne, add, update, remove, sanitizeInput, validateExists };