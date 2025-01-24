import * as v from 'valibot'

const ERR_NAME_LEN = 'Name must be between 3 and 100 characters long'


const name = v.pipe(
    v.string(),
    v.minLength(3, ERR_NAME_LEN),
    v.maxLength(100, ERR_NAME_LEN)
    )


const franchiseSchema = v.object({
    name: name
})

const franchiseOptional = v.partial(franchiseSchema)

export const validateNewFranchise = v.safeParserAsync(franchiseSchema)
export const validateUpdateFranchise = v.safeParserAsync(franchiseOptional)