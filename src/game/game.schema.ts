import * as v from 'valibot';

const [GAME_TITLE_MIN, GAME_TITLE_MAX] = [1, 180];
const [GAME_SYN_MIN, GAME_SYN_MAX] = [10, 512];
const ERR_GAME_TITLE_MIN = `The game name need at least ${GAME_TITLE_MIN} character`;
const ERR_GAME_TITLE_MAX = `Technically, the longest game name in history has less than ${GAME_TITLE_MAX} characters, if you need more, you are doing it wrong, or better use kanjis, weeb`;
const ERR_GAME_SYN_MIN = `The game synopsis need at least ${GAME_SYN_MIN} characters`;
const ERR_GAME_SYN_MAX = `The game synopsis is too long, try to be more concise`;
const ERR_DATE = `The date must be in a valid format`;
const ERR_URL = `The url is not valid`;
const URL_END = ['.png', '.jpg', 'jpeg', 'webp'];
const ERR_URL_END = `URL must end with ${Object.values(URL_END).join(', ')}`;

const gameName = v.pipe(
  v.string(),
  v.minLength(GAME_TITLE_MIN, ERR_GAME_TITLE_MIN),
  v.maxLength(GAME_TITLE_MAX, ERR_GAME_TITLE_MAX),
);

const gameSynopsis = v.pipe(
  v.string(),
  v.minLength(GAME_SYN_MIN, ERR_GAME_SYN_MIN),
  v.maxLength(GAME_SYN_MAX, ERR_GAME_SYN_MAX),
);

const gameReleaseDate = v.pipe(v.string(), v.isoDate(ERR_DATE));

const gamePortrait = v.pipe(
  v.string(),
  v.url(ERR_URL),
  /* v.custom(
      (value: unknown) => typeof value === 'string' && URL_END.some((end) => value.endsWith(end)),
      ERR_URL_END
    ) // Las validaciones de momento las realizamos asi
    // Cuando se implemente multer, capaz las cosas sean distintas*/
);

const gameBanner = v.pipe(
  v.string(),
  v.url(ERR_URL),
  /*  v.custom(
      (value: unknown) => typeof value === 'string' && URL_END.some((end) => value.endsWith(end)),
      ERR_URL_END
    )*/
);

export const gameSchema = v.object({
  title: gameName,
  synopsis: v.nullish(gameSynopsis),
  releaseDate: v.nullish(gameReleaseDate),
  portrait: v.nullish(v.string()),
  banner: v.nullish(v.string()),
  // do NOT include these in the schema, they are calculated fields
  // cumulativeRating: v.number(), reviewCount: v.number(),
  franchise: v.nullish(v.number()),
  tags: v.nullish(v.array(v.number())),
  shops: v.nullish(v.array(v.number())),
  platforms: v.nullish(v.array(v.number())),
  studios: v.nullish(v.array(v.number())),
});

export const gameOptional = v.partial(gameSchema);

export const validateGame = v.safeParserAsync(gameSchema);
export const validateUpdateGame = v.safeParserAsync(v.partial(gameSchema));
