import crypto from "node:crypto";
import type { AuthRole, Organizer, RunnerAccount, TokenPayload } from "../types/domain";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 2;
const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me';

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
}

export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedPassword: string): boolean => {
  const [salt, hash] = storedPassword.split(':');

  if (!salt || !hash) {
    return false;
  }

  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(passwordHash, 'hex'));
};

export const createToken = (user: Organizer | RunnerAccount, role: AuthRole): string => {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    sub: user.id,
    email: user.email,
    role,
    exp: Date.now() + TOKEN_TTL_MS,
  });
  const signature = sign(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      return null;
    }

    const expectedSignature = sign(`${header}.${payload}`);

    if (signature.length !== expectedSignature.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const parsedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TokenPayload;

    if (parsedPayload.exp < Date.now()) {
      return null;
    }

    return parsedPayload;
  } catch (err) {
    return null;
  }
};
