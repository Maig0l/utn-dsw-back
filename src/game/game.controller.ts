import { Request, Response, NextFunction } from "express"
import { Game } from "./game.entity.js";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";
import { orm } from "../shared/db/orm.js";
import { populate } from "dotenv";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.entity.js";
import { validateReviewNew } from "../review/review.schema.js";
import { Review } from "../review/review.entity.js";
import { Tag } from "../tag/tag.entity.js";

const API_SECRET = process.env.apiSecret ?? ''

const validParams = "title synopsis releaseDate portrait banner pictures tags studios shops platforms reviews".split(' ')
const hasParams = paramCheckFromList(validParams)

const em = orm.em

async function findAll(req: Request, res: Response) {
    try {
        const games = await em.find(Game, {}, { populate: ['tags', 'shops', 'platforms', 'studios', 'reviews', 'franchise'] })
        res.json({ data: games })
    } catch (err) {
        handleOrmError(res, err)
    }
}

async function findOne(req: Request, res: Response) {
    try {
        const game = await em.findOneOrFail(Game, { id: res.locals.id }, { populate: ['tags', 'platforms', 'studios', 'franchise', 'reviews'] })
        res.json({ data: game })
    } catch (err) {
        handleOrmError(res, err)
    }
}

async function add(req: Request, res: Response) {
    try {
        const game = em.create(Game, res.locals.sanitizedInput)
        await em.flush()
        res.status(201).json({ message: "Game created successfully", data: game })
    } catch (err) {
        handleOrmError(res, err)
    }
}

async function update(req: Request, res: Response) {
    try {
        const game = await em.findOneOrFail(Game, { id: res.locals.id })
        em.assign(game, res.locals.sanitizedInput)
        await em.flush()
        res.json({ message: "Game updated", data: game })
    } catch (err) {
        handleOrmError(res, err)
    }
}

async function remove(req: Request, res: Response) {
    try {
        const game = await em.findOneOrFail(Game, { id: res.locals.id })
        const gameRef = em.getReference(Game, res.locals.id)
        await em.removeAndFlush(gameRef)

        res.json({ message: "Game deleted successfully", data: game })
    } catch (err) {
        handleOrmError(res, err)
    }
}

async function listReviews(req: Request, res: Response) {
    try {
        const game = await em.findOneOrFail(Game, { id: res.locals.id })
        const reviews = await game.reviews.loadItems()
        res.json({ message: `Listing ${game.reviews.count()} reviews for ${game.title}`, data: reviews })
    } catch (e) {
        return handleOrmError(res, e)
    }
}

async function createReview(req: Request, res: Response) {
    // traer una referencia del gameId
    let gameReference: Game;
    try {
        gameReference = await em.getReference(Game, res.locals.id)
    } catch (err) {
        return handleOrmError(res, err)
    }

    // Verificar que trae el auth header
    if (!req.headers.authorization)
        return res.status(401).json({ message: "Gotta log in for that!" })
    let token = req.headers.authorization
    // Tenemos que explicitar que el tokenData extraído es any porque si no TS se queja de que puede ser string o JwtPayload
    // Pero sabemos por "regla de negocio" que en el payload viene un objeto con id...
    // TODO: Debería explicitarse eso en el código con una interfaz but anyways
    let tokenData: any;
    try {
        tokenData = await jwt.verify(token, API_SECRET)
    } catch (e) {
        return res.status(400).json({ message: "Invalid session token" })
    }

    // extraer el user id del jwt y traer una *referencia* de la db
    let userReference;
    if (!('id' in tokenData)) {
        return res.status(500).json({ message: "Invalid session token" })
    }
    try {
        userReference = em.getReference(User, tokenData.id)
    } catch (e) {
        return handleOrmError(res, e)
    }

    // crear la entidad review y cargarla a la db
    let incoming = await validateReviewNew(req.body)
    if (!incoming.success)
        return res.status(400).json({ message: "Invalid input: " + incoming.issues[0].message })
    const review: any = { ...incoming.output }
    review.author = userReference
    review.game = gameReference

    let loadedReview;
    try {
        loadedReview = em.create(Review, review)
        await em.flush()
    } catch (e) {
        return handleOrmError(res, e)
    }
    res.status(201).json({ message: "Review created!", data: loadedReview })
}


//middleware

function sanitizeInput(req: Request, res: Response, next: NextFunction) {

    if (["PUT"].includes(req.method) && !hasParams(req.body, true))
        return res.status(400)
            .json({ message: "Must provide all attributes" })

    if (["POST", "PATCH"].includes(req.method) && !hasParams(req.body, false))
        return res.status(400)
            .json({ message: "Must provide at least one valid attribute" })


    res.locals.sanitizedInput = {
        title: req.body.title,
        synopsis: req.body.synopsis,
        releaseDate: req.body.releaseDate,
        portrait: req.body.portrait,
        banner: req.body.banner,
        pictures: req.body.pictures,
        tags: req.body.tags,
        studios: req.body.studios,
        shops: req.body.shops,
        platforms: req.body.platforms,
        reviews: req.body.reviews
    }
    const sanitizedInput = res.locals.sanitizedInput

    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    if (!urlRegex.test(req.body.site))
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

function validateExists(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);

    if (Number.isNaN(id))
        return res.status(400).json({ message: "ID must be an integer" })


    res.locals.id = id

    next();
}

function handleOrmError(res: Response, err: any) {
    console.error("\n--- ORM ERROR ---")
    console.error(err.message)

    if (err.code) {
        switch (err.code) {
            case "ER_DUP_ENTRY":
                // Ocurre cuando el usuario quiere crear un objeto con un atributo duplicado en una tabla marcada como Unique
                res.status(400).json({ message: `A game with that name/site already exists.` })
                break
            case "ER_DATA_TOO_LONG":
                res.status(400).json({ message: `Data too long.` })
                break
        }
    }
    else {
        switch (err.name) {
            case "NotFoundError":
                res.status(404).json({ message: `game not found for ID ${res.locals.id}` })
                break
            default:
                res.status(500).json({ message: "Oops! Something went wrong. This is our fault." })
                break
        }
    }
}

export { findAll, findOne, add, update, remove, sanitizeInput, handleOrmError, validateExists, createReview, listReviews }
