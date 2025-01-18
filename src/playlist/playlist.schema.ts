import * as v from 'valibot'

const [NAME_LEN_MIN, NAME_LEN_MAX] = [1, 100]
const ERR_NAME_LEN = `Name must be between ${NAME_LEN_MIN} and ${NAME_LEN_MAX} characters long`
const ERR_BAD_NAME = 'Invalid characters in playlist name. It can alphanumeric characters and dots.'
const [DESC_LEN_MIN, DESC_LEN_MAX] = [1, 255]
const ERR_DESC_LEN = `Description must be between ${DESC_LEN_MIN} and ${DESC_LEN_MAX} characters long`
const ERR_BAD_DESC = 'Invalid characters in playlist description. It can alphanumeric characters and dots.'

const name = v.pipe(
  v.string(),
  v.minLength(NAME_LEN_MIN, ERR_NAME_LEN),
  v.maxLength(NAME_LEN_MAX, ERR_NAME_LEN),
  v.regex(/^[a-zA-Z0-9.,!?;:()\-]+$/, ERR_BAD_NAME) // Matches a-z, A-Z, 0-9, and common punctuation
  )

  const description = v.pipe(
    v.string(),
    v.minLength(DESC_LEN_MIN, ERR_DESC_LEN),
    v.maxLength(DESC_LEN_MAX, ERR_DESC_LEN),
    v.regex(/^[a-zA-Z0-9.,!?;:()\-]+$/, ERR_BAD_DESC) // Matches a-z, A-Z, 0-9, and common punctuation
    )

const isPrivate = v.boolean()
const playlistSchema = v.object({
  name: name,
  description: description,
  isPrivate: v.boolean()
})

export const validatePlaylist = v.safeParserAsync(playlistSchema)