import { JwtPayload } from "jsonwebtoken";

/**
 * Representa el objeto de usuario dentro del payload del JWT
 */
export interface UserAuthObject extends JwtPayload {
  id: number;
  nick: string;
  is_admin: boolean;
}
