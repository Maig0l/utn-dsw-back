import * as v from 'valibot'

const ERR_NAME_LEN = 'Description must be between 3 and 100 characters long'
const ERR_URL = 'URL must be a valid URL'
const ERR_URL_EMPTY = 'URL cannot be empty'
const ERR_URL_END = 'URL must end with .com'

const name = v.pipe(
    v.string(),
    v.minLength(3, ERR_NAME_LEN),
    v.maxLength(100, ERR_NAME_LEN)
    )

const img = v.pipe(
    v.string(),
    v.nonEmpty(ERR_URL_EMPTY),
    v.url(ERR_URL)
    )
    

const site = v.pipe(
    v.string(),
    v.nonEmpty(ERR_URL_EMPTY),
    v.url(ERR_URL),
    v.endsWith('.com', ERR_URL_END)
    )

const shopSchema = v.object({
    name: name,
    img: v.optional(img),
    site: v.optional(site)
})

const shopOptional = v.partial(shopSchema)

export const validateNewShop = v.safeParserAsync(shopSchema)
export const validateUpdateShop = v.safeParserAsync(shopOptional)