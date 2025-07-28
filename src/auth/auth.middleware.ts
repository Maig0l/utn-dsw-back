import { Request, Response, NextFunction } from "express";
import { UserAuthObject } from "./userAuthObject.interface.js";
import Jwt from "jsonwebtoken";
import { orm } from "../shared/db/orm.js";
import { User } from "../user/user.entity.js";
import { Reference } from "@mikro-orm/core";

const API_SECRET = process.env.apiSecret ?? "";

export class AuthError extends Error { }

/**
 * Extracts the UserAuthObject from the JWT in the header
 * @param authHeader
 * @throws AuthError with the message for the client
 */
export function getUserTokenDataFromAuthHeader(
  authHeader: string | undefined,
): UserAuthObject {
  if (!authHeader) throw new AuthError("Must log in");
  if (!authHeader.includes("Bearer ")) throw new AuthError("Must log in");
  const token = authHeader.split("Bearer ")[1];

  let tokenData: UserAuthObject;
  try {
    tokenData = Jwt.verify(token, API_SECRET) as UserAuthObject;
  } catch (error) {
    throw new AuthError("Invalid token");
  }

  // additional checks
  if (tokenData.iss != "Wellplayed.gg" || tokenData.sub != "UserDataToken") {
    throw new AuthError("Invalid token");
  }

  return tokenData;
}

/**
 * Gets a Reference to the given UserID in the JWT for the ORM to use
 * @param authHeader
 * @throws AuthError when the auth token is missing or invalid (calling for a 401)
 * @throws Error just in case the EM can't make the reference (unknown)
 */
export function getUserReferenceFromAuthHeader(
  authHeader: string | undefined,
): User {
  const tokenData = getUserTokenDataFromAuthHeader(authHeader);

  let userReference;
  try {
    userReference = orm.em.getReference(User, tokenData.id);
  } catch (error) {
    throw new Error("Unknown error");
  }
  return userReference;
}

export function getAndSaveUserObjectsToResponseLocals(req: Request, res: Response, next: NextFunction) {
  let currentUserTokenData, currentUserReference;
  try {
    currentUserTokenData = getUserTokenDataFromAuthHeader(req.headers.authorization);
    currentUserReference = getUserReferenceFromAuthHeader(req.headers.authorization);
  } catch (e) {
    if (e instanceof AuthError)
      return res.status(401).json({ message: e.message });

    else if (e instanceof Error)
      return res.status(500).json({ message: e.message });

    return res.status(500).json({ message: 'Unknown error' });
  }

  res.locals.currentUserTokenData = currentUserTokenData;
  res.locals.currentUserOrmReference = currentUserReference;
  next();
}


/**
 * Checks if user is admin from its JWT data. Throws 403 and stops middleware flow if not.
 * Assumes middleware used: getAndSaveUserObjectsToResponseLocals
 */
export function isAdminGuard(req: Request, res: Response, next: NextFunction) {
  if (!res.locals.currentUserTokenData.is_admin)
    return res.status(403).json({ message: "You need admin status to perform this action." })
  next();
}
