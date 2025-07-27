import { orm } from "../shared/db/orm.js"
import { hashPassword } from "./user.controller.js";
import { User } from "./user.entity.js";

const em = orm.em;
const DEFAULT_NICK = "Admin";
const DEFAULT_PASS = "Admin_init1";
const DEFAULT_EMAIL = "";

export async function initializeAdminUserIfAbsent(): Promise<boolean> {
  const user = await em.findOne(User, { nick: DEFAULT_NICK });
  if (user)
    return true;

  const passwordEncrypted = hashPassword(DEFAULT_PASS);

  const userData = {
    nick: DEFAULT_NICK,
    password: passwordEncrypted,
    email: DEFAULT_EMAIL,
    is_admin: true,
  }

  try {
    em.create(User, userData)
    await em.flush()
    console.info(`-- First user created. Login with credentials:\n Nick: ${DEFAULT_NICK}\n Password: ${DEFAULT_PASS}`)
    return true;
  } catch (e) {
    console.error("-- DB error while initializing admin user.")
    console.error("-- Check your DB credentials in the .env file.")
    console.error(e);
    return false;
  }
}
