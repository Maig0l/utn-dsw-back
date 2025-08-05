import * as v from 'valibot';

const [NAME_LEN_MIN, NAME_LEN_MAX] = [1, 100];
const ERR_NAME_LEN = `Name must be between ${NAME_LEN_MIN} and ${NAME_LEN_MAX} characters long`;
const ERR_BAD_NAME =
  'Invalid characters in platform name. It can contain alphanumeric characters, spaces, and common punctuation.';
const ERR_BAD_IMG = 'Invalid image URL';

const name = v.pipe(
  v.string(),
  v.minLength(NAME_LEN_MIN, ERR_NAME_LEN),
  v.maxLength(NAME_LEN_MAX, ERR_NAME_LEN),
  v.regex(/^[a-zA-Z0-9\s.,!?;:()\-]+$/, ERR_BAD_NAME) // Matches a-z, A-Z, 0-9, spaces, and common punctuation
);

const img = v.optional(v.pipe(v.string(), v.url()));

const platformSchema = v.object({
  name: name,
  img: img,
});

export const validatePlatform = v.safeParserAsync(platformSchema);
