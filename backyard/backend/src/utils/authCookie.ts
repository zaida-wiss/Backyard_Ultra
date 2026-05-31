import type { Request, Response } from "express";

import { config } from "../config/env.js";

const AUTH_COOKIE_NAME = "backyard_auth";
const AUTH_COOKIE_MAX_AGE_MS = 2 * 60 * 60 * 1000;

const getAuthCookieOptions = () => ({
  httpOnly: true,
  maxAge: AUTH_COOKIE_MAX_AGE_MS,
  path: "/",
  sameSite: "lax" as const,
  secure: config.nodeEnv === "production",
});

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

const clearAuthCookie = (res: Response) => {
  const { maxAge: _maxAge, ...cookieOptions } = getAuthCookieOptions();

  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
};

const getAuthCookieToken = (req: Request) => {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const authCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!authCookie) {
    return null;
  }

  return decodeURIComponent(authCookie.slice(AUTH_COOKIE_NAME.length + 1));
};

export {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  getAuthCookieToken,
  setAuthCookie,
};
