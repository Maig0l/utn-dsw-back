import * as v from 'valibot'

const ERR_ENTER_ID = 'Must provide an object ID'
const ERR_SCORE_RANGE = 'Score must be a value in the range [0; 5]. Will be rounded to 0.5'

const id = v.pipe(
  v.number(ERR_ENTER_ID),
  v.integer(ERR_ENTER_ID)
)

const score = v.pipe(
  v.number(),
  v.minValue(0, ERR_SCORE_RANGE),
  v.maxValue(5, ERR_SCORE_RANGE),
)

const reviewSchema = v.object({
  author: id, // TODO: Borrar. Esto tiene que venir inferido por el Header de Autenticación
  game: id,
  score: score,
  title: v.optional(v.string()),
  body: v.optional(v.string()),
  suggestedTags: v.optional(v.array(id))
})

// La review se edita mediante PATCH => Admite Objeto parcial
const reviewEditSchema = v.partial(
  v.object({
    score: score,
    title: v.string(),
    body: v.string(),
    suggestedTags: v.array(id)
  })
)

export const validateReviewNew = v.safeParserAsync(reviewSchema)
export const validateReviewEdit = v.safeParserAsync(reviewEditSchema)
