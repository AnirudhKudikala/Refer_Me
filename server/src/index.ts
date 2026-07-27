import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import meRoutes from "./routes/me.js";
import seekersRoutes from "./routes/seekers.js";
import interestsRoutes from "./routes/interests.js";
import conversationsRoutes from "./routes/conversations.js";
import { setupSocket } from "./socket/index.js";

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/me", meRoutes);
app.use("/seekers", seekersRoutes);
app.use("/interests", interestsRoutes);
app.use("/conversations", conversationsRoutes);

app.use(errorHandler);

setupSocket(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
