import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, ExternalLink, MessageSquare, Clock, DollarSign, Briefcase, MapPin, CalendarClock } from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Textarea } from "../../components/ui/Textarea";
import { Modal } from "../../components/ui/Modal";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { InterestBadge } from "../../components/domain/InterestBadge";
import { ResumeActions } from "../../components/domain/ResumeActions";
import { api } from "../../lib/api";
import { formatDateTime } from "../../lib/utils";

export default function SeekerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [message, setMessage] = useState("");

  const { data: seeker, isLoading } = useQuery({
    queryKey: ["seeker", id],
    queryFn: () => api.getSeeker(id!),
    enabled: !!id,
  });

  const interestMutation = useMutation({
    mutationFn: () => api.createInterest(id!, message || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seeker", id] });
      queryClient.invalidateQueries({ queryKey: ["seekers"] });
      setShowInterestModal(false);
      setMessage("");
    },
  });

  if (isLoading) {
    return (
      <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="mx-auto max-w-2xl"><ProfileSkeleton /></div>
      </PageTransition>
    );
  }

  if (!seeker) {
    return (
      <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted">Seeker not found</p>
      </PageTransition>
    );
  }

  const isPending = seeker.interest?.status === "PENDING";
  const isAccepted = seeker.interest?.status === "ACCEPTED";

  return (
    <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted hover:text-theme mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <GlassCard padding="lg">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))" }}
              >
                {seeker.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-theme">{seeker.fullName}</h1>
                <p className="text-muted">{seeker.headline}</p>
                {seeker.profileUpdatedAt && (
                  <p className="flex items-center gap-1.5 text-xs text-muted mt-1.5">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Profile updated {formatDateTime(seeker.profileUpdatedAt)}
                  </p>
                )}
              </div>
            </div>
            {seeker.interest && <InterestBadge status={seeker.interest.status as "PENDING" | "ACCEPTED" | "DECLINED"} />}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="flex items-center gap-2 text-muted"><MapPin className="h-4 w-4 text-accent" /> {seeker.location || "—"}</div>
            <div className="flex items-center gap-2 text-muted"><Briefcase className="h-4 w-4 text-accent" /> {seeker.experienceYears} years exp</div>
            <div className="flex items-center gap-2 text-muted"><Clock className="h-4 w-4 text-accent" /> {seeker.noticePeriod || "—"}</div>
            <div className="flex items-center gap-2 text-muted"><DollarSign className="h-4 w-4 text-accent" /> {seeker.salaryExpectation || "—"}</div>
          </div>

          <p className="text-theme/90 leading-relaxed mb-6">{seeker.bio || "No bio provided."}</p>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-muted mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {seeker.skills.map((s) => <Badge key={s} variant="green">{s}</Badge>)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted mb-2">Desired Roles</h3>
              <div className="flex flex-wrap gap-1.5">
                {seeker.desiredRoles.map((r) => <Badge key={r} variant="purple">{r}</Badge>)}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-theme space-y-3">
            <h3 className="text-sm font-medium text-accent">Contact & Links</h3>
            {seeker.email && (
              <a href={`mailto:${seeker.email}`} className="flex items-center gap-2 text-sm text-muted hover:text-theme">
                <Mail className="h-4 w-4" /> {seeker.email}
              </a>
            )}
            {seeker.linkedinUrl && (
              <a href={seeker.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted hover:text-theme">
                <ExternalLink className="h-4 w-4" /> LinkedIn Profile
              </a>
            )}
            {seeker.portfolioUrl && (
              <a href={seeker.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted hover:text-theme">
                <ExternalLink className="h-4 w-4" /> Portfolio
              </a>
            )}
            {seeker.resume && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 rounded-xl p-3 glass">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-theme truncate">{seeker.resume.fileName}</p>
                    {seeker.resume.uploadedAt && (
                      <p className="text-xs text-muted mt-0.5">
                        Resume updated {formatDateTime(seeker.resume.uploadedAt)}
                      </p>
                    )}
                  </div>
                  <ResumeActions
                    fileName={seeker.resume.fileName}
                    mimeType={seeker.resume.mimeType}
                    seekerId={id!}
                  />
                </div>
              </div>
            )}
          </div>

          {!seeker.interest && (
            <Button className="w-full mt-6" onClick={() => setShowInterestModal(true)}>
              Express Interest
            </Button>
          )}
          {isPending && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center mt-4">Interest sent — waiting for candidate to respond</p>
          )}
          {isAccepted && seeker.interest?.conversationId && (
            <Link to={`/chat/${seeker.interest.conversationId}`} className="block mt-4">
              <Button variant="secondary" className="w-full"><MessageSquare className="h-4 w-4" /> Open Chat</Button>
            </Link>
          )}
        </GlassCard>
      </div>

      <Modal open={showInterestModal} onClose={() => setShowInterestModal(false)} title="Express Interest">
        <p className="text-sm text-muted mb-4">
          Send an optional message to {seeker.fullName}. They'll receive an email notification.
        </p>
        <Textarea rows={3} placeholder="Hi! I'd love to refer you for..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button className="w-full mt-4" onClick={() => interestMutation.mutate()} isLoading={interestMutation.isPending}>
          Send Request
        </Button>
      </Modal>
    </PageTransition>
  );
}
