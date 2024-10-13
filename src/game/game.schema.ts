
import * as v from 'valibot'

const [GAME_TITLE_LEN_MIN, GAME_TITLE_LEN_MAX] = [1 , 400]
const [GAME_SYNOPSIS_LEN_MIN, GAME_SYNOPSIS_LEN_MAX] = [1, 1000]
const [RELEASEDATE_MIN, RELEASEDATE_MAX] = [new Date(1970, 0, 1), new Date()]
const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
const ERR_TITLE_LEN = `Title must be between ${GAME_TITLE_LEN_MIN} and ${GAME_TITLE_LEN_MAX} characters`
const ERR_SYNOPSIS_LEN = `Synopsis must be between ${GAME_SYNOPSIS_LEN_MIN} and ${GAME_SYNOPSIS_LEN_MAX} characters`
const ERR_RELEASEDATE = `Release date must be between ${RELEASEDATE_MIN} and ${RELEASEDATE_MAX}`
const ERR_IMAGE = `Invalid image extension. Must be one of the following formats: ${VALID_IMAGE_EXTENSIONS.join(', ')}`
const ERR_ENTER_ID = 'Must provide an object ID'
const ERR_INV_URL = 'Invalid URL'

const id = v.pipe(
    v.number(ERR_ENTER_ID),
    v.integer(ERR_ENTER_ID)
  )

const gameTitle = v.pipe(
    v.string(),
    v.minLength(GAME_TITLE_LEN_MIN, ERR_TITLE_LEN),
    v.maxLength(GAME_TITLE_LEN_MAX, ERR_TITLE_LEN)
)

const gameSynopsis = v.pipe(
    v.string(),
    v.minLength(GAME_SYNOPSIS_LEN_MIN, ERR_SYNOPSIS_LEN),
    v.maxLength(GAME_SYNOPSIS_LEN_MAX, ERR_SYNOPSIS_LEN)
)

const releaseDate = v.pipe(
    v.date(),
    v.minValue(RELEASEDATE_MIN, ERR_RELEASEDATE),
    v.maxValue(RELEASEDATE_MAX, ERR_RELEASEDATE)
)

const image = v.pipe(
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
);
  

const gameSchema = v.object({
    title: gameTitle,
    synopsis: gameSynopsis,
    releaseDate: v.optional(releaseDate),
    portrait: image,
    banner: image,
    pictures: image,
    tags: v.optional(v.array(id)),
    studios: v.optional(v.array(id)),
    shops: v.optional(v.array(id)),
    franchises: v.optional(v.array(id)),
    platforms: v.optional(v.array(id)),
    reviews: v.optional(v.array(id)),
})

export const validateGame = v.safeParserAsync(gameSchema)


