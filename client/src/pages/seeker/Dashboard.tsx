import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileText, ExternalLink, MessageSquare, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "../../components/layout/PageTransition";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { InterestBadge } from "../../components/domain/InterestBadge";
import { ResumeUpload } from "../../components/domain/ResumeUpload";
import { staggerContainer, fadeUp } from "../../lib/motion";
import { getProfileCompletion, type SeekerProfileFields } from "../../lib/profileCompletion";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { formatDateTime } from "../../lib/utils";

function ProfileCompletion({ me }: { me: NonNullable<ReturnType<typeof useAuthStore.getState>["me"]> }) {
  const profile = me.seekerProfile;
  if (!profile) return null;

  const pct = getProfileCompletion(
    {
      fullName: profile.fullName,
      headline: profile.headline,
      bio: profile.bio,
      skills: profile.skills,
      desiredRoles: profile.desiredRoles,
      experienceYears: profile.experienceYears,
      location: profile.location,
      noticePeriod: profile.noticePeriod ?? "",
      salaryExpectation: profile.salaryExpectation ?? "",
      immediateJoining: profile.immediateJoining ?? false,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
    } satisfies SeekerProfileFields,
    !!me.resume
  );

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted">Profile completion</span>
        <span className="text-sm font-semibold text-accent">{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-cyan))" }}
        />
      </div>
      {pct < 100 && (
        <Link to="/seeker/profile" className="mt-3 inline-block text-sm text-accent hover:opacity-80">
          Complete your profile →
        </Link>
      )}
      {profile.updatedAt && (
        <p className="text-xs text-muted mt-3">Profile last updated {formatDateTime(profile.updatedAt)}</p>
      )}
    </GlassCard>
  );
}

export default function SeekerDashboard() {
  const { me } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: interests = [] } = useQuery({
    queryKey: ["interests"],
    queryFn: () => api.getInterests(),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => api.updateInterest(id, "ACCEPTED"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["interests"] }),
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => api.updateInterest(id, "DECLINED"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["interests"] }),
  });

  const pending = interests.filter((i) => i.status === "PENDING");

  return (
    <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-theme">
            Welcome{me?.seekerProfile?.fullName ? `, ${me.seekerProfile.fullName}` : ""}
          </h1>
          <p className="text-muted mt-1">Manage your profile and review incoming referral requests.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {me && <ProfileCompletion me={me} />}

          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-accent" />
              <h2 className="font-medium text-theme">Resume</h2>
            </div>
            <ResumeUpload showProfileUpdated />
          </GlassCard>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-purple-400" />
            <h2 className="font-medium text-theme">Incoming Requests</h2>
            {pending.length > 0 && <Badge variant="purple">{pending.length} pending</Badge>}
          </div>

          {interests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="When referrers express interest in your profile, they'll appear here."
              action={
                <Link to="/seeker/profile">
                  <Button variant="secondary">Improve your profile</Button>
                </Link>
              }
            />
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
              {interests.map((interest) => (
                <motion.div key={interest.id} variants={fadeUp}>
                  <GlassCard padding="sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-theme">
                            {interest.referrer.referrerProfile?.fullName || interest.referrer.email}
                          </span>
                          <InterestBadge status={interest.status} />
                        </div>
                        <p className="text-sm text-muted">
                          {interest.referrer.referrerProfile?.jobTitle} at {interest.referrer.referrerProfile?.company}
                        </p>
                        {interest.message && (
                          <p className="text-sm text-muted/70 mt-2 italic">"{interest.message}"</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {interest.status === "PENDING" && (
                          <>
                            <Button size="sm" onClick={() => updateMutation.mutate(interest.id)} isLoading={updateMutation.isPending}>
                              Accept
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => declineMutation.mutate(interest.id)}>
                              Decline
                            </Button>
                          </>
                        )}
                        {interest.status === "ACCEPTED" && interest.conversation && (
                          <Link to={`/chat/${interest.conversation.id}`}>
                            <Button size="sm" variant="secondary">
                              <MessageSquare className="h-3 w-3" /> Chat
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Link to="/seeker/profile">
            <Button variant="secondary"><ExternalLink className="h-4 w-4" /> Edit Profile</Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
