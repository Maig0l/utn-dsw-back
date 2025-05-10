import * as v from "valibot";
import { StudioType } from "./studio.entity.js";

const ERR_NAME_LEN = "Name must be between 3 and 100 characters long";
const TYPE = StudioType;
const ERR_SITE_URL = "Site URL must be a valid URL";
const ERR_TYPE = 'Type must be either "Developer", "Publisher, or "Both"';
const ERR_SITE_URL_EMPTY = "Site URL cannot be empty";
const URL_START = ["http://", "https://"];
const ERR_SITE_URL_START = `Site URL must start with http:// or https://`;
const URL_END = [".com", ".net", ".org", ".io"];
const ERR_SITE_URL_END = `Site URL must end with ${Object.values(URL_END).join(", ")}`;

const name = v.pipe(
  v.string(),
  v.minLength(3, ERR_NAME_LEN),
  v.maxLength(100, ERR_NAME_LEN),
);

const type = v.pipe(v.string(ERR_TYPE), v.enum(TYPE, ERR_TYPE));

const site = v.pipe(
  v.string(),
  v.nonEmpty(ERR_SITE_URL_EMPTY),
  v.url(ERR_SITE_URL),
  v.custom(
    (value: unknown) =>
      typeof value === "string" &&
      URL_START.some((start) => value.startsWith(start)),
    ERR_SITE_URL_START,
  ),
  v.custom(
    (value: unknown) =>
      typeof value === "string" && URL_END.some((end) => value.endsWith(end)),
    ERR_SITE_URL_END,
  ),
);

const studioSchema = v.object({
  name: name,
  type: type,
  site: v.optional(site),
});

const studioOptional = v.partial(studioSchema);

export const validateNewStudio = v.safeParserAsync(studioSchema);
export const validateUpdateStudio = v.safeParserAsync(studioOptional);
