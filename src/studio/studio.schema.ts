import * as v from 'valibot'
import { StudioType } from './studio.entity.js'

const ERR_NAME_LEN = 'Description must be between 3 and 100 characters long'
const TYPE = StudioType
const ERR_URL = 'URL must be a valid URL'
const ERR_TYPE = 'Type must be either "Developer", "Publisher, or "Both"'
const ERR_URL_EMPTY = 'URL cannot be empty'
const ERR_URL_END = 'URL must end with .com'

const name = v.pipe(
    v.string(),
    v.minLength(3, ERR_NAME_LEN),
    v.maxLength(100, ERR_NAME_LEN)
    )

const type = v.pipe(
    v.string(ERR_TYPE),
    v.enum(TYPE, ERR_TYPE)
    )    

const site = v.pipe(
    v.string(),
    v.nonEmpty(ERR_URL_EMPTY),
    v.url(ERR_URL),
    v.endsWith('.com', ERR_URL_END)
    )

const studioSchema = v.object({
    name: name,
    type: type,
    site: v.optional(site)
})

const studioOptional = v.partial(studioSchema)

export const validateNewStudio = v.safeParserAsync(studioSchema)
export const validateUpdateStudio = v.safeParserAsync(studioOptional)