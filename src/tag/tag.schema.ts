import * as v from 'valibot'

const ERR_DESCRIP_LEN = 'Description must be between 10 and 500 characters long'
const ERR_NAME_LEN = 'Name must be between 3 and 30 characters long'

const name = v.pipe(
    v.string(),
    v.minLength(3, ERR_NAME_LEN),
    v.maxLength(30, ERR_NAME_LEN)
    )

const description = v.pipe(
    v.string(),
    v.minLength(10, ERR_DESCRIP_LEN),
    v.maxLength(500, ERR_DESCRIP_LEN)
    )

const tagSchema = v.object({
    name: name,
    description: description
})

const tagOptional= v.partial(tagSchema)

export const validateNewTag = v.safeParserAsync(tagSchema)
export const validateUpdateTag = v.safeParserAsync(tagOptional)