import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { matchesAnyFuzzy } from "../lib/fuzzy.js";
import { getNoticePeriodLabel } from "../lib/profileCompletion.js";
import { getResumeFilePath, serveResumeFile } from "../lib/resumeFile.js";

const router = Router();

type SeekerResumeRow = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
};

type SeekerProfileRow = {
  fullName: string;
  headline: string;
  bio: string;
  skills: string[];
  desiredRoles: string[];
  experienceYears: number;
  location: string;
  noticePeriod: string;
  salaryExpectation: string;
  immediateJoining: boolean;
  updatedAt: Date;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  user: {
    id: string;
    avatarUrl: string | null;
    email: string;
    resume: SeekerResumeRow | null;
  };
};

type ReferrerInterestRow = {
  id: string;
  seekerId: string;
  status: string;
  message: string | null;
  conversation: { id: string } | null;
};

function mapSeeker(
  s: SeekerProfileRow,
  interest?: ReferrerInterestRow | null
) {
  return {
    id: s.user.id,
    fullName: s.fullName,
    headline: s.headline,
    bio: s.bio,
    skills: s.skills,
    desiredRoles: s.desiredRoles,
    experienceYears: s.experienceYears,
    location: s.location,
    noticePeriod: getNoticePeriodLabel(s),
    immediateJoining: s.immediateJoining,
    salaryExpectation: s.salaryExpectation,
    profileUpdatedAt: s.updatedAt.toISOString(),
    linkedinUrl: s.linkedinUrl,
    portfolioUrl: s.portfolioUrl,
    email: s.user.email,
    avatarUrl: s.user.avatarUrl,
    resume: s.user.resume,
    interest: interest
      ? { id: interest.id, status: interest.status, message: interest.message, conversationId: interest.conversation?.id }
      : null,
  };
}

router.get("/", requireAuth, requireRole("REFERRER"), async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const { skills, roles, minExp, maxExp, location, page = "1", limit = "10", sort = "updated_desc", updatedUntil, interestStatus } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const sortOrder = sort === "updated_asc" ? "asc" : "desc";

    const skillList = skills ? (skills as string).split(",").filter(Boolean) : [];
    const roleList = roles ? (roles as string).split(",").filter(Boolean) : [];

    const where: Record<string, unknown> = {
      user: { role: "SEEKER" },
      fullName: { not: "" },
      headline: { not: "" },
    };

    if (minExp || maxExp) {
      where.experienceYears = {};
      if (minExp) (where.experienceYears as Record<string, number>).gte = parseInt(minExp as string, 10);
      if (maxExp) (where.experienceYears as Record<string, number>).lte = parseInt(maxExp as string, 10);
    }
    if (location) {
      where.location = { contains: location as string, mode: "insensitive" };
    }
    if (updatedUntil && typeof updatedUntil === "string") {
      const parts = updatedUntil.split("-").map(Number);
      if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
        const endOfDay = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
        where.updatedAt = { lte: endOfDay };
      }
    }

    const [allSeekers, interests] = await Promise.all([
      prisma.seekerProfile.findMany({
        where,
        orderBy: { updatedAt: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              avatarUrl: true,
              email: true,
              resume: true,
            },
          },
        },
      }),
      prisma.interest.findMany({
        where: { referrerId: authReq.auth!.userId },
        include: { conversation: { select: { id: true } } },
      }),
    ]) as [SeekerProfileRow[], ReferrerInterestRow[]];

    const interestMap = new Map<string, ReferrerInterestRow>(
      interests.map((interest) => [interest.seekerId, interest])
    );

    let filtered = allSeekers.filter((seeker) => {
      if (skillList.length && !matchesAnyFuzzy(seeker.skills, skillList)) return false;
      if (roleList.length && !matchesAnyFuzzy(seeker.desiredRoles, roleList)) return false;
      return true;
    });

    const statusFilter = typeof interestStatus === "string" ? interestStatus : "ALL";
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((seeker) => interestMap.get(seeker.user.id)?.status === statusFilter);
    }

    const total = filtered.length;
    const skip = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(skip, skip + limitNum);

    res.json({
      data: paginated.map((seeker) => {
        const interest = interestMap.get(seeker.user.id);
        return {
          id: seeker.user.id,
          fullName: seeker.fullName,
          headline: seeker.headline,
          bio: seeker.bio,
          skills: seeker.skills,
          desiredRoles: seeker.desiredRoles,
          experienceYears: seeker.experienceYears,
          location: seeker.location,
          noticePeriod: getNoticePeriodLabel(seeker),
          immediateJoining: seeker.immediateJoining,
          salaryExpectation: seeker.salaryExpectation,
          profileUpdatedAt: seeker.updatedAt.toISOString(),
          avatarUrl: seeker.user.avatarUrl,
          interest: interest
            ? { id: interest.id, status: interest.status }
            : null,
        };
      }),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, requireRole("REFERRER"), async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const seekerId = req.params.id as string;
    const profile = (await prisma.seekerProfile.findUnique({
      where: { userId: seekerId },
      include: {
        user: { select: { id: true, avatarUrl: true, email: true, resume: true } },
      },
    })) as SeekerProfileRow | null;
    if (!profile) return res.status(404).json({ error: "Seeker not found" });

    const interest = (await prisma.interest.findUnique({
      where: { referrerId_seekerId: { referrerId: authReq.auth!.userId, seekerId } },
      include: { conversation: { select: { id: true } } },
    })) as ReferrerInterestRow | null;

    res.json(mapSeeker(profile, interest));
  } catch (err) {
    next(err);
  }
});

router.get("/:id/resume", requireAuth, requireRole("REFERRER"), async (req, res, next) => {
  try {
    const seekerId = req.params.id as string;
    const resume = await prisma.resume.findUnique({ where: { userId: seekerId } });
    if (!resume) return res.status(404).json({ error: "No resume found" });

    const inline = req.query.inline === "1" || req.query.inline === "true";
    const filePath = getResumeFilePath(resume.fileUrl);
    serveResumeFile(res, filePath, resume.fileName, resume.mimeType, inline);
  } catch (err) {
    next(err);
  }
});

export default router;
