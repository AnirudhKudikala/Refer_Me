import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { Role } from "@prisma/client";
import { verifyAccessToken } from "../lib/jwt.js";

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role | null;
}

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

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, res, next) => {
    const authReq = req as AuthRequest;
    if (!authReq.auth?.role || !roles.includes(authReq.auth.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
