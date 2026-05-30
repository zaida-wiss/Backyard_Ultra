import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { config } from "../config/env.js";
import type { AuthRole, TokenPayload } from "../types/domain.js";

type TokenUser = {
  id: string;
  email: string;
};

type VerifiedJwtPayload = JwtPayload & {
  sub: string;
  email: string;
  role: AuthRole;
  exp: number;
};

const TOKEN_TTL = "2h";
const authRoles: AuthRole[] = ["admin", "organizer", "runner"];

const hashPassword = async (password: string): Promise<string> => {
  // bcrypt saltar och hashar lösenordet. Vi sparar aldrig lösenord i klartext.
  return bcrypt.hash(password, 12);
};

const verifyPassword = async (
  password: string,
  storedPassword: string,
): Promise<boolean> => {
  // compare hashar det inkommande lösenordet på samma sätt och jämför med det sparade hashvärdet.
  return bcrypt.compare(password, storedPassword);
};

const createToken = (user: TokenUser, role: AuthRole): string => {
  // Tokenen innehåller minsta möjliga auth-data: id, email och roll.
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role,
    },
    config.authSecret,
    { expiresIn: TOKEN_TTL },
  );
};

const isAuthRole = (role: unknown): role is AuthRole => {
  return authRoles.includes(role as AuthRole);
};

const toTokenPayload = (payload: JwtPayload): TokenPayload | null => {
  if (!payload.sub) {
    return null;
  }

  if (typeof payload.email !== "string") {
    return null;
  }

  if (!isAuthRole(payload.role)) {
    return null;
  }

  if (!payload.exp) {
    return null;
  }

  const jwtPayload = payload as VerifiedJwtPayload;

  return {
    sub: jwtPayload.sub,
    email: jwtPayload.email,
    role: jwtPayload.role,
    exp: jwtPayload.exp,
  };
};

const verifyToken = (token: string): TokenPayload | null => {
  try {
    // jwt.verify kontrollerar både signaturen och att tokenen inte har gått ut.
    const payload = jwt.verify(token, config.authSecret);

    // jsonwebtoken kan returnera en string-payload, men vi använder alltid objekt-payload.
    if (typeof payload === "string") {
      return null;
    }

    // Om något viktigt saknas behandlar vi tokenen som ogiltig.
    return toTokenPayload(payload);
  } catch {
    return null;
  }
};

export { createToken, hashPassword, verifyPassword, verifyToken };
