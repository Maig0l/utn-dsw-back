import * as v from 'valibot'

const [NICK_LEN_MIN, NICK_LEN_MAX] = [3, 30]
const ERR_NICK_LEN = `Nick must be ${NICK_LEN_MIN} to ${NICK_LEN_MAX} characters long.`
const ERR_NICK_DOTS = 'Your nick cannot start or end with a dot'
const ERR_NICK_DOTDOT = 'You cannot use 2 or more consecutive dots in your nickname'
const ERR_BAD_NICK = 'Invalid characters in username. It can alphanumeric characters and dots.'
const ERR_BAD_EMAIL = 'Invalid email address.'
const ERR_BAD_PASS = 'Invalid password. Must have 8-50 characters, at least one letter, one number and one special character.'

/** Requisitos del nickname:
 * No debe haber un usuario con el mismo nick
 * Caract. permitidos: a-z A-Z 0-9 _ .
 * No se permite empezar ni terminar el nick con (.)
 * No se admiten nicks con dos o más (.) consecutivos
 * Longitud: 3 <= L <= 30
 */
const nick = v.pipe(
  v.string(),
  v.minLength(NICK_LEN_MIN, ERR_NICK_LEN),
  v.maxLength(NICK_LEN_MAX, ERR_NICK_LEN),
  v.regex(
    /^[^.].*[^.]$/,
    ERR_NICK_DOTS
  ),
  v.regex(
    /^(?!.*\.\.).*$/,
    ERR_NICK_DOTDOT
  ),
  v.regex(
    /^[\w\.]+$/,
    ERR_BAD_NICK
  )
)
const email = v.pipe(v.string(), v.email(ERR_BAD_EMAIL))
/** Requisitos de la contraseña:
 * Longitud: 8 >= L >= 50 (limitación de bcrypt)
 * Caracteres obligatorios: 1x letra, 1x número, 1x caractér especial
 * RegEx tomado de: https://stackoverflow.com/a/21456918
 * TODO: El espacio no está siendo tomado como caracter especial
 */
const passwordRegister = v.pipe(
  v.string(),
  v.regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d @$!%*#?&]{8,50}$/,
    ERR_BAD_PASS
  )
)
const passwordLogin = v.string()
const profileImg = v.string()
const bioText = v.string()
const linkedAccounts = v.array(v.string())

export const userRegistrationSchema = v.object({
  nick: nick,
  email: email,
  password: passwordRegister,
  profileImg: v.nullish(profileImg)
})

export const userLoginSchema = v.object({
  nick: nick,
  password: passwordLogin
})