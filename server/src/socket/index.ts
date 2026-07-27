import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import type { TokenPayload } from "../lib/jwt.js";

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;
      if (!token) return next(new Error("Unauthorized"));
      const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", async (conversationId: string) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { interest: true },
      });
      if (!conversation) return;
      const { interest } = conversation;
      if (interest.referrerId !== socket.data.userId && interest.seekerId !== socket.data.userId) return;
      if (interest.status !== "ACCEPTED") return;
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("message", async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!content?.trim()) return;
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { interest: true },
      });
      if (!conversation) return;
      const { interest } = conversation;
      if (interest.referrerId !== socket.data.userId && interest.seekerId !== socket.data.userId) return;
      if (interest.status !== "ACCEPTED") return;

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: socket.data.userId,
          content: content.trim(),
        },
        include: { sender: { select: { id: true, avatarUrl: true } } },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      io.to(`conversation:${conversationId}`).emit("message", message);
    });

    socket.on("typing", ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit("typing", { userId: socket.data.userId });
    });
  });

  return io;
}
