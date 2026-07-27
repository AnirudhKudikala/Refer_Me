import { Router } from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { uploadResume } from "../middleware/upload.js";
import { env } from "../config/env.js";
import { isProfileFullyComplete } from "../lib/profileCompletion.js";
import { getResumeFilePath, serveResumeFile } from "../lib/resumeFile.js";

async function refreshProfileCompletion(userId: string) {
  const profile = await prisma.seekerProfile.findUnique({ where: { userId } });
  if (!profile) return;
  const resume = await prisma.resume.findUnique({ where: { userId } });
  await prisma.seekerProfile.update({
    where: { userId },
    data: { isProfileComplete: isProfileFullyComplete(profile, !!resume) },
  });
}

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      include: {
        seekerProfile: true,
        referrerProfile: true,
        resume: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      seekerProfile: user.seekerProfile,
      referrerProfile: user.referrerProfile,
      resume: user.resume,
    });
  } catch (err) {
    next(err);
  }
});

const seekerProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  desiredRoles: z.array(z.string()).optional(),
  experienceYears: z.number().int().min(0).optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  noticePeriod: z.string().optional(),
  salaryExpectation: z.string().optional(),
  immediateJoining: z.boolean().optional(),
});

router.patch("/seeker-profile", requireAuth, requireRole("SEEKER"), async (req: AuthRequest, res, next) => {
  try {
    const data = seekerProfileSchema.parse(req.body);
    const existing = await prisma.seekerProfile.findUnique({ where: { userId: req.auth!.userId } });
    if (!existing) return res.status(404).json({ error: "Profile not found" });

    const merged = {
      ...existing,
      ...data,
      linkedinUrl: data.linkedinUrl !== undefined ? (data.linkedinUrl || null) : existing.linkedinUrl,
      portfolioUrl: data.portfolioUrl !== undefined ? (data.portfolioUrl || null) : existing.portfolioUrl,
      noticePeriod: data.immediateJoining ? "" : (data.noticePeriod ?? existing.noticePeriod),
      immediateJoining: data.immediateJoining ?? existing.immediateJoining,
    };

    const resume = await prisma.resume.findUnique({ where: { userId: req.auth!.userId } });
    const isProfileComplete = isProfileFullyComplete(merged, !!resume);

    const profile = await prisma.seekerProfile.update({
      where: { userId: req.auth!.userId },
      data: {
        ...data,
        linkedinUrl: data.linkedinUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        noticePeriod: merged.immediateJoining ? "" : (data.noticePeriod ?? undefined),
        immediateJoining: data.immediateJoining,
        isProfileComplete,
      },
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

const referrerProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
});

router.patch("/referrer-profile", requireAuth, requireRole("REFERRER"), async (req: AuthRequest, res, next) => {
  try {
    const data = referrerProfileSchema.parse(req.body);
    const profile = await prisma.referrerProfile.update({
      where: { userId: req.auth!.userId },
      data,
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.get("/resume", requireAuth, requireRole("SEEKER"), async (req: AuthRequest, res, next) => {
  try {
    const resume = await prisma.resume.findUnique({ where: { userId: req.auth!.userId } });
    if (!resume) return res.status(404).json({ error: "No resume found" });

    const inline = req.query.inline === "1" || req.query.inline === "true";
    const filePath = getResumeFilePath(resume.fileUrl);
    serveResumeFile(res, filePath, resume.fileName, resume.mimeType, inline);
  } catch (err) {
    next(err);
  }
});

router.post("/resume", requireAuth, requireRole("SEEKER"), uploadResume.single("resume"), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const existing = await prisma.resume.findUnique({ where: { userId: req.auth!.userId } });
    if (existing) {
      const oldPath = path.join(env.uploadDir, path.basename(existing.fileUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await prisma.resume.delete({ where: { userId: req.auth!.userId } });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.auth!.userId,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
    await refreshProfileCompletion(req.auth!.userId);
    res.status(201).json(resume);
  } catch (err) {
    next(err);
  }
});

router.delete("/resume", requireAuth, requireRole("SEEKER"), async (req: AuthRequest, res, next) => {
  try {
    const resume = await prisma.resume.findUnique({ where: { userId: req.auth!.userId } });
    if (!resume) return res.status(404).json({ error: "No resume found" });
    const filePath = path.join(env.uploadDir, path.basename(resume.fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.resume.delete({ where: { userId: req.auth!.userId } });
    await refreshProfileCompletion(req.auth!.userId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
