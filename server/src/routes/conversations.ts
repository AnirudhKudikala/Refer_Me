import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

async function canAccessConversation(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { interest: true },
  });
  if (!conversation) return null;
  const { interest } = conversation;
  if (interest.referrerId !== userId && interest.seekerId !== userId) return null;
  if (interest.status !== "ACCEPTED") return null;
  return conversation;
}

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        interest: {
          status: "ACCEPTED",
          OR: [{ referrerId: req.auth!.userId }, { seekerId: req.auth!.userId }],
        },
      },
      include: {
        interest: {
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
                seekerProfile: { select: { fullName: true, headline: true, desiredRoles: true } },
              },
            },
          },
        },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/messages", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const conversation = await canAccessConversation(req.auth!.userId, req.params.id as string);
    if (!conversation) return res.status(403).json({ error: "Forbidden" });

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, avatarUrl: true } } },
    });

    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: { not: req.auth!.userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    res.json(messages);
  } catch (err) {
    next(err);
  }
});

const messageSchema = z.object({ content: z.string().min(1).max(2000) });

router.post("/:id/messages", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const conversation = await canAccessConversation(req.auth!.userId, req.params.id as string);
    if (!conversation) return res.status(403).json({ error: "Forbidden" });

    const { content } = messageSchema.parse(req.body);
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: req.auth!.userId,
        content,
      },
      include: { sender: { select: { id: true, avatarUrl: true } } },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

export default router;
