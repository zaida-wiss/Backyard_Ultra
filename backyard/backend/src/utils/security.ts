import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

import type { AuthRole, TokenPayload } from "../types/domain";

type TokenUser = {
  id: string;
  email: string;
};

const TOKEN_TTL = "2h";

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";

  return secret;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  storedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, storedPassword);
};

export const createToken = (user: TokenUser, role: AuthRole): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role,
    },
    getAuthSecret(),
    { expiresIn: TOKEN_TTL },
  );
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const payload = jwt.verify(token, getAuthSecret());

    if (typeof payload === "string") {
      return null;
    }

    const jwtPayload = payload as JwtPayload & {
      sub?: string;
      email?: string;
      role?: AuthRole;
    };

    if (!jwtPayload.sub || !jwtPayload.email || !jwtPayload.role || !jwtPayload.exp) {
      return null;
    }

    return {
      sub: jwtPayload.sub,
      email: jwtPayload.email,
      role: jwtPayload.role,
      exp: jwtPayload.exp,
    };
  } catch {
    return null;
  }
};
