import * as v from 'valibot'

const [FRANCH_NAME_LEN_MIN, FRANCH_TAG_NAME_LEN_MAX] = [3, 30]
const ERR_NAME_LEN = `Name must be between ${FRANCH_NAME_LEN_MIN} and ${FRANCH_TAG_NAME_LEN_MAX}`
const ERR_ENTER_ID = 'Must provide an object ID'

const id = v.pipe(
    v.number(ERR_ENTER_ID),
    v.integer(ERR_ENTER_ID)
  )

const franchName = v.pipe(
    v.string(),
    v.minLength(FRANCH_NAME_LEN_MIN, ERR_NAME_LEN),
    v.maxLength(FRANCH_TAG_NAME_LEN_MAX, ERR_NAME_LEN)
)

const franchSchema = v.object({
    name: franchName,
    games: v.optional(v.array(v.array(id)))
})

export const validateFranchise = v.safeParserAsync(franchSchema)