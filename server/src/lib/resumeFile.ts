import path from "path";
import fs from "fs";
import type { Response } from "express";
import { env } from "../config/env.js";

export function getResumeFilePath(fileUrl: string): string {
  return path.join(env.uploadDir, path.basename(fileUrl));
}

export function serveResumeFile(
  res: Response,
  filePath: string,
  fileName: string,
  mimeType: string,
  inline: boolean
) {
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.setHeader("Content-Type", mimeType);
  res.setHeader(
    "Content-Disposition",
    `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(fileName)}"`
  );
  res.sendFile(path.resolve(filePath));
}
