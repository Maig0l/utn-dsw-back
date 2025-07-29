import * as v from "valibot";

const ERR_NAME_LEN = "Shop name must be between 3 and 100 characters long";

const ERR_IMG_URL_EMPTY = "img URL cannot be empty";

const ERR_SITE_URL_EMPTY = "site URL cannot be empty";
const ERR_SITE_URL = "site URL must be a valid URL (http(s)://___.com)";
const ERR_SITE_URL_END = "site URL must end with .com";

const name = v.pipe(
  v.string(),
  v.minLength(3, ERR_NAME_LEN),
  v.maxLength(100, ERR_NAME_LEN),
);

const site = v.pipe(
  v.string(),
  v.nonEmpty(ERR_SITE_URL_EMPTY),
  v.url(ERR_SITE_URL),
  v.endsWith(".com", ERR_SITE_URL_END),
);

const shopSchema = v.object({
  name: name,
  site: v.optional(site),
});

const shopOptional = v.partial(shopSchema);

export const validateNewShop = v.safeParserAsync(shopSchema);
export const validateUpdateShop = v.safeParserAsync(shopOptional);
