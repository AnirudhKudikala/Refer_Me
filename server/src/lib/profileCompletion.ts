import { z } from "zod";

export interface SeekerProfileFields {
  fullName: string;
  headline: string;
  bio: string;
  skills: string[];
  desiredRoles: string[];
  experienceYears: number;
  location: string;
  currentCompany: string;
  noticePeriod: string;
  salaryExpectation: string;
  immediateJoining: boolean;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  otherSocialUrl?: string | null;
}

type SeekerProfileLike = Partial<SeekerProfileFields> & {
  fullName?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  desiredRoles?: string[];
  experienceYears?: number;
  location?: string;
  currentCompany?: string;
  noticePeriod?: string;
  salaryExpectation?: string;
  immediateJoining?: boolean;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  otherSocialUrl?: string | null;
};

const urlSchema = z.string().url();

function isValidUrl(value?: string | null): boolean {
  if (!value?.trim()) return false;
  return urlSchema.safeParse(value.trim()).success;
}

function hasProfileLink(profile: SeekerProfileFields): boolean {
  return isValidUrl(profile.linkedinUrl) || isValidUrl(profile.portfolioUrl);
}

export function toSeekerProfileFields(profile: SeekerProfileLike): SeekerProfileFields {
  return {
    fullName: profile.fullName ?? "",
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    skills: profile.skills ?? [],
    desiredRoles: profile.desiredRoles ?? [],
    experienceYears: profile.experienceYears ?? 0,
    location: profile.location ?? "",
    currentCompany: profile.currentCompany ?? "",
    noticePeriod: profile.noticePeriod ?? "",
    salaryExpectation: profile.salaryExpectation ?? "",
    immediateJoining: profile.immediateJoining ?? false,
    linkedinUrl: profile.linkedinUrl ?? null,
    portfolioUrl: profile.portfolioUrl ?? null,
    githubUrl: profile.githubUrl ?? null,
    otherSocialUrl: profile.otherSocialUrl ?? null,
  };
}

export function getProfileCompletion(profile: SeekerProfileFields, hasResume: boolean): number {
  const checks = [
    profile.fullName.trim().length >= 2,
    profile.headline.trim().length >= 3,
    profile.bio.trim().length >= 20,
    profile.skills.length >= 1,
    profile.desiredRoles.length >= 1,
    profile.location.trim().length >= 2,
    profile.currentCompany.trim().length >= 2,
    profile.salaryExpectation.trim().length >= 1,
    profile.immediateJoining || profile.noticePeriod.trim().length >= 1,
    hasResume,
    hasProfileLink(profile),
    isValidUrl(profile.githubUrl),
    isValidUrl(profile.otherSocialUrl),
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function isProfileFullyComplete(profile: SeekerProfileFields, hasResume: boolean): boolean {
  return getProfileCompletion(profile, hasResume) === 100;
}

export function getNoticePeriodLabel(profile: Pick<SeekerProfileFields, "immediateJoining" | "noticePeriod">): string {
  if (profile.immediateJoining) return "Immediate";
  return profile.noticePeriod;
}
