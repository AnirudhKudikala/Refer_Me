import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { sendInterestNotification } from "../lib/email.js";

const router = Router();

const createInterestSchema = z.object({
  seekerId: z.string(),
  message: z.string().max(500).optional(),
});

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const role = req.auth!.role;
    const interests = await prisma.interest.findMany({
      where: role === "REFERRER" ? { referrerId: req.auth!.userId } : { seekerId: req.auth!.userId },
      orderBy: { createdAt: "desc" },
      include: {
        referrer: {
          select: {
            id: true,
            email: true,
            avatarUrl: true,
            referrerProfile: { select: { fullName: true, company: true, jobTitle: true } },
          },
        },
        seeker: {
          select: {
            id: true,
            email: true,
            avatarUrl: true,
            seekerProfile: { select: { fullName: true, headline: true, skills: true } },
          },
        },
        conversation: { select: { id: true } },
      },
    });
    res.json(interests);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("REFERRER"), async (req: AuthRequest, res, next) => {
  try {
    const { seekerId, message } = createInterestSchema.parse(req.body);
    if (seekerId === req.auth!.userId) {
      return res.status(400).json({ error: "Cannot express interest in yourself" });
    }

    const existing = await prisma.interest.findUnique({
      where: { referrerId_seekerId: { referrerId: req.auth!.userId, seekerId } },
    });
    if (existing) return res.status(409).json({ error: "Interest already exists", interest: existing });

    const seeker = await prisma.user.findUnique({ where: { id: seekerId }, select: { email: true } });
    if (!seeker) return res.status(404).json({ error: "Seeker not found" });

    const interest = await prisma.interest.create({
      data: { referrerId: req.auth!.userId, seekerId, message },
    });

    sendInterestNotification(seeker.email).catch((err) => {
      console.error("Failed to send interest email:", err);
    });

    res.status(201).json(interest);
  } catch (err) {
    next(err);
  }
});

const updateInterestSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

router.patch("/:id", requireAuth, requireRole("SEEKER"), async (req: AuthRequest, res, next) => {
  try {
    const { status } = updateInterestSchema.parse(req.body);
    const interest = await prisma.interest.findUnique({ where: { id: req.params.id as string } });
    if (!interest) return res.status(404).json({ error: "Interest not found" });
    if (interest.seekerId !== req.auth!.userId) return res.status(403).json({ error: "Forbidden" });
    if (interest.status !== "PENDING") return res.status(400).json({ error: "Interest already resolved" });

    const updated = await prisma.interest.update({
      where: { id: interest.id },
      data: { status },
    });

    if (status === "ACCEPTED") {
      await prisma.conversation.create({ data: { interestId: updated.id } });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
