import * as v from 'valibot'

const [SHOP_NAME_LEN_MIN, SHOP_NAME_LEN_MAX] = [3, 30]
const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
const ERR_NAME_LEN = `Name must be between ${SHOP_NAME_LEN_MIN} and ${SHOP_NAME_LEN_MAX}`
const ERR_ENTER_ID = 'Must provide an object ID'
const ERR_IMAGE = `Invalid image extension. Must be one of the following formats: ${VALID_IMAGE_EXTENSIONS.join(', ')}`
const ERR_INV_URL = 'Invalid URL'


const id = v.pipe(
    v.number(ERR_ENTER_ID),
    v.integer(ERR_ENTER_ID)
)

const shopName = v.pipe(
    v.string(),
    v.minLength(SHOP_NAME_LEN_MIN, ERR_NAME_LEN),
    v.maxLength(SHOP_NAME_LEN_MAX, ERR_NAME_LEN)
)

const shopSite = v.pipe(
    v.string(),
    v.url(ERR_INV_URL),
)

const shopImg = v.pipe(
    v.string(),
    v.url(ERR_INV_URL),
    v.custom((value) => {
        try {
            const url = new URL(value as string);
            const extension = url.pathname.split('.').pop()?.toLowerCase();
            return !!extension && VALID_IMAGE_EXTENSIONS.includes(extension);
        } catch (error) {
            return false;
        }
    }, ERR_IMAGE)
)

const shopSchema = v.object({
    name: shopName,
    site: shopSite,
    img: shopImg,
    games: v.optional(v.array(id))
})

export const validateShop = v.safeParserAsync(shopSchema)