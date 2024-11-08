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
  author: id,
  game: id,
  score: score,
  title: v.optional(v.string()),
  body: v.optional(v.string()),
  suggestedTags: v.optional(v.array(id))
})

// Schema a usar cuando el game/user id vienen codificados en la request (url/header)
const reviewSchemaNoId = v.object({
  score: score,
  title: v.optional(v.string()),
  body: v.optional(v.string()),
  suggestedTags: v.optional(v.array(id))
})

export const validateNewReview = v.safeParserAsync(reviewSchema)
export const validateNewReviewFromRequest = v.safeParserAsync(reviewSchemaNoId)
