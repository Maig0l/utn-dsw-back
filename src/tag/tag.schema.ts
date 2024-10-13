import * as v from 'valibot'

const [TAG_NAME_LEN_MIN, TAG_NAME_LEN_MAX] = [3, 30]
const [TAG_DESC_LEN_MIN, TAG_DESC_LEN_MAX] = [0, 100]
const ERR_NAME_LEN = `Name must be between ${TAG_NAME_LEN_MIN} and ${TAG_NAME_LEN_MAX}`
const ERR_DESC_LEN = `Description must be between ${TAG_DESC_LEN_MIN} and ${TAG_DESC_LEN_MAX}`
const ERR_ENTER_ID = 'Must provide an object ID'

const id = v.pipe(
    v.number(ERR_ENTER_ID),
    v.integer(ERR_ENTER_ID)
  )

const tagName = v.pipe(
    v.string(),
    v.minLength(TAG_NAME_LEN_MIN, ERR_NAME_LEN),
    v.maxLength(TAG_NAME_LEN_MAX, ERR_NAME_LEN)
)

const tagDesc = v.pipe(
    v.string(),
    v.minLength(TAG_DESC_LEN_MIN, ERR_DESC_LEN),
    v.maxLength(TAG_DESC_LEN_MAX, ERR_DESC_LEN)
)

const tagSchema = v.object({
    name: tagName,
    description: tagDesc,
    games: v.optional(v.array(id))
})

export const validateTag = v.safeParserAsync(tagSchema)