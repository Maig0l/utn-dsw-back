import { Request, Response, NextFunction } from "express"
import { Release } from "./release.entity.js";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";
import { orm } from "../shared/db/orm.js";

const VALID_PARAMS = "siteUrl".split(' ')
const hasParams = paramCheckFromList(VALID_PARAMS)

const em = orm.em

async function findAll(req: Request, res: Response) {
    try {
        const releases = await em.find(Release, {})
        res.status(200).json({message: 'found all releases', data: releases})
    } catch (err) {
        handleOrmError(res, err)
    }
}

async function findOne(req: Request, res: Response) {
    try {
        const id = Number.parseInt(res.locals.id)
        const release = await em.findOneOrFail(Release, {id})
        res.status(200).json({message: 'found release', data: release})
    } catch (err) {
        handleOrmError(res, err)
    }
}

async function add(req: Request, res: Response) {
    try {
        const release = em.create(Release, req.body)
        await em.flush()
        res.status(201).json({message: 'release created', data: release})
    } catch (err) {
        handleOrmError(res, err)
    }
}

async function update(req: Request, res: Response) {
    res.status(500).json({message: "Not implemented"})
}

async function remove(req: Request, res: Response) {
    try {
        const id = Number.parseInt(res.locals.id)
        const release = em.getReference(Release, id)
        await em.removeAndFlush(release)
        res.status(200).json({message: 'release deleted', data: release})
    } catch (err) {
        handleOrmError(res, err)
    }
}

function sanitizeInput(req: Request, res: Response, next: NextFunction) {
    if (["POST", "PUT"].includes(req.method) && !hasParams(req.body, true)) {
        res.status(400).json({message: "Missing parameters"})
    }

    if ("PATCH" === req.method && !hasParams(req.body, false))
        res.status(400).json({message: "Missing parameters"})
    
    res.locals.sanitizedInput = {
        siteUrl: req.body.siteUrl
    }

  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  if (req.body.site && !urlRegex.test(req.body.site))
    return res.status(400).json({message: "Invalid Site attribute (Should be a URL)"})

    next()
}

function handleOrmError(res: Response, err: any) {
    if (err.code) {
      switch (err.code) {
        case "ER_DUP_ENTRY":
          // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
          res.status(400).json({message: `A shop with that name/site already exists.`})
          break
        case "ER_DATA_TOO_LONG":
          res.status(400).json({message: `Data too long.`})
          break
      }
    }
    else {
      switch (err.name) {
        case "NotFoundError":
          res.status(404).json({message: `Shop not found for ID ${res.locals.id}`})
          break
        default:
          console.error("\n--- ORM ERROR ---")
          console.error(err.message)
          res.status(500).json({message: "Oops! Something went wrong. This is our fault."})
          break
      }
    }
  }

export { findAll, findOne, add, update, remove, sanitizeInput, handleOrmError }

