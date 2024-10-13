import * as v from 'valibot'

const [PLATFORM_NAME_LEN_MIN, PLATFORM_NAME_LEN_MAX] = [3, 30]
const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
const ERR_NAME_LEN = `Name must be between ${PLATFORM_NAME_LEN_MIN} and ${PLATFORM_NAME_LEN_MAX}`
const ERR_ENTER_ID = 'Must provide an object ID'
const ERR_IMAGE = `Invalid image extension. Must be one of the following formats: ${VALID_IMAGE_EXTENSIONS.join(', ')}`

const id = v.pipe(
    v.number(ERR_ENTER_ID),
    v.integer(ERR_ENTER_ID)
  )

const platformName = v.pipe(
    v.string(),
    v.minLength(PLATFORM_NAME_LEN_MIN, ERR_NAME_LEN),
    v.maxLength(PLATFORM_NAME_LEN_MAX, ERR_NAME_LEN)
)

const image = v.pipe(
    v.string(),
    v.custom((value) => {
        try {
            const url = new URL(value as string);
            const extension = url.pathname.split('.').pop()?.toLowerCase();
            return !!extension && VALID_IMAGE_EXTENSIONS.includes(extension);
        } catch (error) {
            return false;
        }
    }, ERR_IMAGE)
);

const platformSchema = v.object({
    name: platformName,
    img: image,
    games: v.optional(v.array(id))
})

export const validatePlatform = v.safeParserAsync(platformSchema)