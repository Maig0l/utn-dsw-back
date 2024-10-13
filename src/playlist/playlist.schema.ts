import * as v from 'valibot'

const [PLAYLIST_NAME_LEN_MIN, PLAYLIST_NAME_LEN_MAX] = [3, 100]
const [DESC_LEN_MAX] = [200]
const ERR_NAME_LEN = `Name must be between ${PLAYLIST_NAME_LEN_MIN} and ${PLAYLIST_NAME_LEN_MAX}`
const ERR_DESC_LEN = `Description must be less than ${DESC_LEN_MAX}`
const ERR_ENTER_ID = 'Must provide an object ID'

const id = v.pipe(
    v.number(ERR_ENTER_ID),
    v.integer(ERR_ENTER_ID)
  )

const playlistName = v.pipe(
    v.string(),
    v.minLength(PLAYLIST_NAME_LEN_MIN, ERR_NAME_LEN),
    v.maxLength(PLAYLIST_NAME_LEN_MAX, ERR_NAME_LEN)
)

const playlistDesc = v.pipe(
    v.string(),
    v.maxLength(DESC_LEN_MAX, ERR_DESC_LEN)
)

const privPlaylist = v.pipe(
    v.boolean(),
    v.custom((value) => typeof value === 'boolean', 'Must be a boolean')
)

const playlistSchema = v.object({
    name: playlistName,
    description: v.optional(playlistDesc),
    isPrivate: privPlaylist,
    games: v.optional(v.array(id))
})

export const validatePlaylist = v.safeParserAsync(playlistSchema)