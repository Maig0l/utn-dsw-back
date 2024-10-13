import * as v from 'valibot'

const [STUDIO_NAME_LEN_MIN, STUDIO_NAME_LEN_MAX] = [1, 50]
const [STUDIO_TYPE_LEN_MIN, STUDIO_TYPE_LEN_MAX] = [1, 50]
const ERR_NAME_LEN = `Name must be between ${STUDIO_NAME_LEN_MIN} and ${STUDIO_NAME_LEN_MAX} characters`
const ERR_TYPE_LEN = `Type must be between ${STUDIO_TYPE_LEN_MIN} and ${STUDIO_TYPE_LEN_MAX} characters`
const ERR_ENTER_ID = 'Must provide an object ID'

const id = v.pipe(
    v.number(ERR_ENTER_ID),
    v.integer(ERR_ENTER_ID)
)

const studioName = v.pipe(
    v.string(),
    v.minLength(STUDIO_NAME_LEN_MIN, ERR_NAME_LEN),
    v.maxLength(STUDIO_NAME_LEN_MAX, ERR_NAME_LEN)
)

const studioType = v.pipe(
    v.string(),
    v.minLength(STUDIO_TYPE_LEN_MIN, ERR_TYPE_LEN),
    v.maxLength(STUDIO_TYPE_LEN_MAX, ERR_TYPE_LEN)
)

const studioSite = v.pipe(
    v.string(),
    v.url(),
)

const studioSchema = v.object({
    name: studioName,
    type: studioType,
    site: v.optional(studioSite),
})

export const validateStudio = v.safeParserAsync(studioSchema)