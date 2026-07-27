-- AlterTable: immediate joining flag
ALTER TABLE "SeekerProfile" ADD COLUMN IF NOT EXISTS "immediateJoining" BOOLEAN NOT NULL DEFAULT false;
