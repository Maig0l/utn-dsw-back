import { Request, Response, NextFunction } from "express";
import { UserAuthObject } from "./userAuthObject.interface.js";
import Jwt from "jsonwebtoken";
import { orm } from "../shared/db/orm.js";
import { User } from "../user/user.entity.js";

const API_SECRET = process.env.apiSecret ?? "";

export class AuthError extends Error {}

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
