import * as v from 'valibot'

const name = v.pipe(
  v.string(),
  v.minLength(1, 'Name must be at least 1 character long'),
  v.maxLength(100, 'Name must be at most 100 characters long')
)
const img = v.pipe(
  v.string(),
  v.minLength(1, 'Image URL must be at least 1 character long'),
  v.maxLength(255, 'Image URL must be at most 255 characters long')
  //v.regex()
)

const platformSchema = v.object({
  name: name,
  img: img
})

export const validatePlatform = v.safeParserAsync(platformSchema)