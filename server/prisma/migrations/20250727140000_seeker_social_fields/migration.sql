-- AlterTable
ALTER TABLE "SeekerProfile" ADD COLUMN "currentCompany" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SeekerProfile" ADD COLUMN "githubUrl" TEXT;
ALTER TABLE "SeekerProfile" ADD COLUMN "otherSocialUrl" TEXT;
