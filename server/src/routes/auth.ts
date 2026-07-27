import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, type TokenPayload } from "../lib/jwt.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { env } from "../config/env.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["SEEKER", "REFERRER"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const crossOriginClient =
  env.clientUrl.startsWith("https://") && !env.clientUrl.includes("localhost");

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: crossOriginClient,
    sameSite: crossOriginClient ? ("none" as const) : ("lax" as const),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function setRefreshCookie(res: import("express").Response, token: string) {
  res.cookie("refreshToken", token, refreshCookieOptions());
}

function clearRefreshCookie(res: import("express").Response) {
  res.clearCookie("refreshToken", refreshCookieOptions());
}

function issueTokens(user: { id: string; email: string; role: TokenPayload["role"] }) {
  const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, role } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        ...(role === "SEEKER"
          ? { seekerProfile: { create: {} } }
          : { referrerProfile: { create: {} } }),
      },
    });

    const tokens = issueTokens(user);
    setRefreshCookie(res, tokens.refreshToken);
    res.status(201).json({ accessToken: tokens.accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const tokens = issueTokens(user);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ accessToken: tokens.accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: "No refresh token" });
  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: "User not found" });
    const tokens = issueTokens(user);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ accessToken: tokens.accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/logout", (_req, res) => {
  clearRefreshCookie(res);
  res.json({ ok: true });
});

export default router;
