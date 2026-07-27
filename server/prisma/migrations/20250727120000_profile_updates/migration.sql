-- AlterTable SeekerProfile: add notice period & salary
ALTER TABLE "SeekerProfile" ADD COLUMN IF NOT EXISTS "noticePeriod" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SeekerProfile" ADD COLUMN IF NOT EXISTS "salaryExpectation" TEXT NOT NULL DEFAULT '';

-- AlterTable ReferrerProfile: remove referrable fields
ALTER TABLE "ReferrerProfile" DROP COLUMN IF EXISTS "referrableRoles";
ALTER TABLE "ReferrerProfile" DROP COLUMN IF EXISTS "referrableSkills";
