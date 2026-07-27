import type { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken, type TokenPayload } from "../lib/jwt.js";
import type { UserRole } from "../types/roles.js";

export type AuthPayload = TokenPayload;

export interface AuthRequest extends Request {
  auth?: AuthPayload;
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authReq = req as AuthRequest;
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = header.slice(7);
    authReq.auth = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    const authReq = req as AuthRequest;
    if (!authReq.auth?.role || !roles.includes(authReq.auth.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
