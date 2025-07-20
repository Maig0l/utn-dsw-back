import { NextFunction, Request, Response } from 'express';
import { orm } from '../shared/db/orm.js';
import { Review } from './review.entity.js';
import { validateReviewNew, validateReviewEdit } from './review.schema.js';
import sanitizeHtml from 'sanitize-html';
import {
  AuthError,
  getUserReferenceFromAuthHeader,
} from '../auth/auth.middleware.js';
import { Game } from '../game/game.entity.js';
import { User } from '../user/user.entity.js';
import { Tag } from '../tag/tag.entity.js';
import { FilterQuery } from '@mikro-orm/core';
import { updateRating } from '../game/game.controller.js';

// Mensajes
const ERR_500 = 'Oops! Something went wrong. This is our fault.';

const REVIEW_PAGE_SIZE = 100;
const em = orm.em;

//// *** CRUD *** ////

/** @deprecated */
async function findAll(req: Request, res: Response) {
  try {
    const reviews = await em.find(Review, {}, { populate: ['author', 'game'] });
    res.json({ data: reviews });
  } catch (e) {
    handleOrmError(res, e);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const review = await em.findOneOrFail(
      Review,
      { id: res.locals.id },
      { populate: ['author', 'game'] }
    );
    res.json({ data: review });
  } catch (e) {
    handleOrmError(res, e);
  }
}

/**
 * @deprecated in favor of createReview
 */
async function add(req: Request, res: Response) {
  try {
    console.log('body', req.body);
    console.log('SANITIZED INPUT', res.locals.newReview);
    // TODO newReview doen't contain author and gameId
    const review = await em.create(Review, req.body);
    // update the game's cumulative rating and review count
    // TODO move to final version of createReview
    await updateRating(req.body.game, req.body.score, em);
    await em.flush();

    res
      .status(201)
      .json({ message: 'Review created successfully', data: review });
  } catch (e) {
    handleOrmError(res, e);
  }
}

async function update(req: Request, res: Response) {
  try {
    // Verificar autenticación
    let userReference: User;
    try {
      userReference = getUserReferenceFromAuthHeader(req.headers.authorization);
    } catch (e) {
      if (e instanceof AuthError)
        return res.status(401).json({ message: e.message });
      else if (e instanceof Error)
        return res.status(500).json({ message: e.message });
      else {
        return res.status(500).json({ message: 'Unknown error' });
      }
    }

    // Buscar la review existente
    const review = await em.findOneOrFail(
      Review,
      { id: res.locals.id },
      { populate: ['author', 'game'] }
    );

    // Verificar que el usuario sea el autor de la review
    if (review.author.id !== userReference.id) {
      return res
        .status(403)
        .json({ message: 'You can only edit your own reviews' });
    }

    // Actualizar los campos que vienen en res.locals.newReview
    const updateData = res.locals.newReview;

    if (
      updateData.score !== undefined &&
      typeof updateData.score === 'number'
    ) {
      // Si se actualiza el score, también actualizar el rating del juego
      const oldScore = review.score;
      const newScore = updateData.score;
      review.score = newScore;

      // Actualizar el rating acumulativo del juego
      if (typeof review.game.id !== 'number') {
        throw new Error('Game ID is missing or invalid');
      }
      await updateGameRatingOnEdit(review.game.id, oldScore, newScore, em);
    }

    if (updateData.title !== undefined) {
      review.title = updateData.title;
    }

    if (updateData.body !== undefined) {
      review.body = updateData.body;
    }

    if (updateData.suggestedTags !== undefined) {
      // Limpiar tags existentes y agregar los nuevos
      review.suggestedTags.removeAll();
      const tagArray: Tag[] = [];
      for (const tagId of updateData.suggestedTags) {
        tagArray.push(em.getReference(Tag, tagId));
      }
      review.suggestedTags.add(tagArray);
    }

    await em.flush();

    // Recargar la review con todas las relaciones para la respuesta
    const updatedReview = await em.findOneOrFail(
      Review,
      { id: review.id },
      { populate: ['author', 'game'] }
    );

    res.json({
      message: 'Review updated successfully',
      data: updatedReview,
    });
  } catch (e) {
    handleOrmError(res, e);
  }
}

async function remove(req: Request, res: Response) {
  try {
    // Verificar autenticación
    let userReference: User;
    try {
      userReference = getUserReferenceFromAuthHeader(req.headers.authorization);
    } catch (e) {
      if (e instanceof AuthError)
        return res.status(401).json({ message: e.message });
      else if (e instanceof Error)
        return res.status(500).json({ message: e.message });
      else {
        return res.status(500).json({ message: 'Unknown error' });
      }
    }

    // Buscar la review con relaciones pobladas
    const review = await em.findOneOrFail(
      Review,
      { id: res.locals.id },
      { populate: ['author', 'game'] }
    );

    console.log('Review to delete:', {
      id: review.id,
      gameId: review.game.id,
      gameIdType: typeof review.game.id,
      score: review.score,
      scoreType: typeof review.score,
      authorId: review.author.id,
    });

    // Verificar que el usuario sea el autor de la review
    if (review.author.id !== userReference.id) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own reviews' });
    }

    // Actualizar el rating del juego antes de eliminar la review
    const gameId = Number(review.game.id);
    const reviewScore = Number(review.score);

    if (isNaN(gameId) || isNaN(reviewScore)) {
      console.error('Invalid data:', {
        gameId: review.game.id,
        reviewScore: review.score,
        gameIdType: typeof review.game.id,
        reviewScoreType: typeof review.score,
      });
      return res
        .status(500)
        .json({ message: 'Game ID or review score is missing or invalid' });
    }

    await updateGameRatingOnDelete(gameId, reviewScore, em);

    await em.removeAndFlush(review);
    res.json({ message: 'Review deleted successfully', data: review });
  } catch (e) {
    handleOrmError(res, e);
  }
}

/**
 * Devuelve un listado de reviews para un juego dado.
 * Asume que pasa por el middleware GameController.validateExists.
 * TODO: No tiene mucho sentido el param 'mine' si la regla de negocio dice 1 review por juego por usuario
 * @param req Responde a los queryParams `page: int` y `mine: bool`, y al header `Authorization` si `mine=1`
 * @param res `res.locals` contiene `id` del juego
 */
async function listReviewsForGame(req: Request, res: Response) {
  // Guardar los Parámetros de búsqueda
  const pageNo = Number.parseInt(req.query['page']?.toString() ?? '0');
  const showOnlyOwnedReviews = 'mine' in req.query;

  // Relegar autenticación al middleware
  // Notar que no estamos llamando al middleware desde el router, si no manualmente acá
  let userRef;
  if (showOnlyOwnedReviews) {
    try {
      userRef = getUserReferenceFromAuthHeader(req.headers.authorization);
    } catch (e) {
      if (e instanceof Error)
        return res.status(500).json({ message: e.message });
      if (e instanceof AuthError)
        return res.status(401).json({ message: e.message });
    }
  }

  let criteria: FilterQuery<Review> = {};

  // traer una referencia del gameId
  if (res.locals.id) {
    let gameReference: Game = em.getReference(Game, res.locals.id);
    criteria.game = gameReference;
  }
  if (showOnlyOwnedReviews) criteria.author = userRef;

  let data: Review[] = [];
  try {
    data = await em.find(Review, criteria, {
      limit: REVIEW_PAGE_SIZE,
      offset: pageNo * REVIEW_PAGE_SIZE,
      populate: ['author', 'game'],
    });
  } catch (e) {
    return handleOrmError(res, e);
  }
  res.json({
    message: `Showing ${data.length} reviews (page ${pageNo})`,
    data,
  });
}

/**
 * Crea un listado de las reviews de un usuario. Es de acceso público.
 * @param req Responde al route parameter `nick: string`
 * @param res
 */
async function listReviewsByAuthor(req: Request, res: Response) {
  if (!req.params.nick)
    throw new Error(
      'Middleware listReviewsForUser requires route parameter `nick`'
    );

  let author;
  try {
    author = await em.findOneOrFail(User, { nick: req.params.nick });
  } catch (e) {
    return res.status(404).json({ message: 'User not found' });
  }

  let reviews: Review[] = [];
  try {
    reviews = await em.find(
      Review,
      { author: author },
      {
        // TODO: Game sólo debería poblar sus campos id y title
        populate: ['author', 'game'],
      }
    );
  } catch (e) {
    return handleOrmError(res, e);
  }

  res.json({
    data: reviews,
    message: `Listing ${reviews.length} reviews by ${author.nick}`,
  });
}

async function createReview(req: Request, res: Response) {
  // traer una referencia del gameId
  let gameReference: Game = em.getReference(Game, res.locals.id);

  let userReference: User;
  try {
    userReference = getUserReferenceFromAuthHeader(req.headers.authorization);
  } catch (e) {
    if (e instanceof AuthError)
      return res.status(401).json({ message: e.message });
    else if (e instanceof Error)
      return res.status(500).json({ message: e.message });
    else {
      return res.status(500).json({ message: 'Unknown error' });
    }
  }

  // crear la entidad review y cargarla a la db
  let incoming = await validateReviewNew(req.body);
  if (!incoming.success)
    return res
      .status(400)
      .json({ message: 'Invalid input: ' + incoming.issues[0].message });
  const reviewInput = incoming.output;

  const tagArray: Tag[] = [];
  if (reviewInput.suggestedTags) {
    for (const tagId of reviewInput.suggestedTags) {
      tagArray.push(em.getReference(Tag, tagId));
    }
  }

  const review = new Review();
  review.game = gameReference;
  review.author = userReference;
  review.title = sanitizeHtml(reviewInput.title || '');
  review.body = sanitizeHtml(reviewInput.body || '');
  review.score = reviewInput.score;
  review.suggestedTags.add(tagArray);

  let loadedReview;
  try {
    loadedReview = em.create(Review, review);

    // Actualizar el rating del juego al crear la review
    await updateRating(res.locals.id, reviewInput.score, em);

    await em.flush();
    res.status(201).json({ message: 'Review created!', data: loadedReview });
  } catch (e) {
    return handleOrmError(res, e);
  }
}

//// *** Middlewarez *** ////

async function validateExists(req: Request, res: Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id);
  if (Number.isNaN(id))
    return res.status(400).json({ message: 'ID must be an integer' });

  res.locals.id = id;

  next();
}

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  let incoming;
  switch (req.method) {
    case 'PATCH':
      incoming = await validateReviewEdit(req.body);
      break;
    case 'POST':
    default:
      incoming = await validateReviewNew(req.body);
      break;
  }

  if (!incoming.success) {
    console.log(incoming.issues[0]);
    return res.status(400).json({ message: `: ${incoming.issues[0].message}` });
  }
  const newReview = incoming.output;

  if (newReview.score) newReview.score = roundToNextHalf(newReview.score);
  if (newReview.title) newReview.title = sanitizeHtml(newReview.title);
  if (newReview.body) newReview.body = sanitizeHtml(newReview.body);

  res.locals.newReview = newReview;
  next();
}

//// *** Helper functions *** ////

/** Redondear puntaje hacia arriba hasta el próximo medio punto
 * (por ej.: 3.1 => 3.5; 4.9 => 5.0) */
function roundToNextHalf(num: number) {
  const remainder = num % 0.5;
  if (remainder) return num + (0.5 - remainder);
  return num;
}

/**
 * Actualiza el rating acumulativo del juego cuando se edita una review
 */
async function updateGameRatingOnEdit(
  gameId: number,
  oldScore: number,
  newScore: number,
  em: any
) {
  try {
    const game = await em.findOneOrFail(Game, { id: gameId });

    // Calcular el nuevo rating acumulativo
    // Restar el score anterior y sumar el nuevo
    game.cumulativeRating = game.cumulativeRating - oldScore + newScore;

    await em.flush();
  } catch (e) {
    console.error('Error updating game rating:', e);
    throw e;
  }
}

/**
 * Actualiza el rating acumulativo del juego cuando se elimina una review
 */
async function updateGameRatingOnDelete(
  gameId: number,
  deletedScore: number,
  em: any
) {
  try {
    console.log(
      `Updating rating on delete: gameId=${gameId}, deletedScore=${deletedScore}`
    );

    const game = await em.findOneOrFail(Game, { id: gameId });

    console.log(
      `Game before update: cumulativeRating=${game.cumulativeRating}, reviewCount=${game.reviewCount}`
    );

    // Restar el score de la review eliminada y decrementar el contador
    game.cumulativeRating = game.cumulativeRating - deletedScore;
    game.reviewCount = game.reviewCount - 1;

    console.log(
      `Game after update: cumulativeRating=${game.cumulativeRating}, reviewCount=${game.reviewCount}`
    );

    await em.flush();
  } catch (e) {
    console.error('Error updating game rating on delete:', e);
    throw e;
  }
}

function handleOrmError(res: Response, err: any) {
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        // No debería ocurrir. No hay atributos únicos en esta entidad
        res
          .status(400)
          .json({ message: `A review with those attributes already exists.` });
        break;
      case 'ER_DATA_TOO_LONG':
        res.status(400).json({ message: `Data too long.` });
        break;
    }
  } else {
    switch (err.name) {
      case 'NotFoundError':
        res
          .status(404)
          .json({ message: `Review not found for ID ${res.locals.id}` });
        break;
      default:
        console.error('\n--- ORM ERROR ---');
        console.error(err.message);
        res.status(500).json({ message: ERR_500 });
        break;
    }
  }
}

function throw500(res: Response, err: any) {
  res.status(500).json({ message: ERR_500 });
}

export {
  findAll,
  findOne,
  remove,
  add,
  sanitizeInput,
  validateExists,
  update,
  createReview,
  listReviewsForGame,
  listReviewsByAuthor,
};
