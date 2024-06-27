import { Request, Response, NextFunction, response } from "express"
import { StudioRepository } from "./studio.repository.js"

const Repository = new StudioRepository();

function findAll(req: Request, res: Response) {
    const studios = Repository.findAll();
    if (!studios) {
        return res.status(404).json({ message: "Studio Not Found" });
    }
    res.status(200).json(studios);
}

function findById(req: Request, res: Response) {
    const studio = Repository.findById({ id: parseInt(req.params.id) });
    if (!studio) {
        return res.status(404).json({ message: "Studio Not Found" });
    }
    res.status(200).json(studio);
}

function add(req: Request, res: Response) {
    const studio = Repository.add(req.body);
    if (!studio) {
        return res.status(400).json({ message: "Bad Request" });
    }
    res.status(201).json(studio);
}

function update(req: Request, res: Response) {
    const studio = Repository.update(req.body);
    if (!studio) {
        return res.status(404).json({ message: "Studio Not Found" });
    }
    res.status(200).json(studio);
}

function remove(req: Request, res: Response) {
    const studio = Repository.remove({ id: parseInt(req.params.id) });
    if (!studio) {
        return res.status(404).json({ message: "Studio Not Found" });
    }
    res.status(200).json(studio);
}

function sanitizeInput(req:Request, res:Response, next:NextFunction) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

    res.locals.sanitizedInput = {
        name: req.body.name,
        type: req.body.type,
        site: req.body.site
    }

    if (!req.body.site.match(urlRegex)) {
        return res.status(400).json({ message: "Bad Request" }); // chequear esto
    }

    Object.keys(res.locals.sanitizedInput).forEach((key) => {
        if (!res.locals.sanitizedInput[key] === undefined) {
            delete res.locals.sanitizedInput[key];
        }
    });
    
    next();
}

function validateExists(req:Request, res:Response, next:NextFunction) {
    const id = parseInt(req.params.id);

    if (Number.isNaN(id))
        return res.status(400).json({ message: "ID must be an integer" })

    const studio = Repository.findById({ id });

    if (!studio) 
        return res.status(404).json({ message: "Studio Not Found with the selected ID" });

    next();
}
    
export { findAll, findById, add, update, remove, sanitizeInput, validateExists };