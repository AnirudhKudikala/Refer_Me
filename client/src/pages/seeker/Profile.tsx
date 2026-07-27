import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "../../components/layout/PageTransition";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { TagInput } from "../../components/ui/TagInput";
import { Badge } from "../../components/ui/Badge";
import { ImmediateJoiningField } from "../../components/ui/ImmediateJoiningField";
import { ResumeUpload } from "../../components/domain/ResumeUpload";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { getNoticePeriodLabel, getProfileCompletion } from "../../lib/profileCompletion";
import { formatDateTime } from "../../lib/utils";

export default function SeekerProfile() {
  const { me, setMe } = useAuthStore();
  const profile = me?.seekerProfile;
  const [form, setForm] = useState({
    fullName: profile?.fullName ?? "",
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    skills: profile?.skills ?? [],
    desiredRoles: profile?.desiredRoles ?? [],
    experienceYears: profile?.experienceYears ?? 0,
    location: profile?.location ?? "",
    noticePeriod: profile?.noticePeriod ?? "",
    salaryExpectation: profile?.salaryExpectation ?? "",
    immediateJoining: profile?.immediateJoining ?? false,
    linkedinUrl: profile?.linkedinUrl ?? "",
    portfolioUrl: profile?.portfolioUrl ?? "",
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.updateSeekerProfile(form),
    onSuccess: async () => {
      const updated = await api.getMe();
      setMe(updated);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/seeker");
    },
  });

  const update = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }));

  const completion = getProfileCompletion(
    {
      ...form,
      noticePeriod: form.immediateJoining ? "" : form.noticePeriod,
    },
    !!me?.resume
  );

  const noticeLabel = getNoticePeriodLabel(form);

  return (
    <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <h1 className="text-2xl font-semibold text-theme mb-6">Edit Profile</h1>
          <GlassCard className="space-y-4">
            <Input label="Full Name" value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} />
            <Input label="Headline" value={form.headline} onChange={(e) => update({ headline: e.target.value })} />
            <Input label="Location" value={form.location} onChange={(e) => update({ location: e.target.value })} />
            <Input label="Years of Experience" type="number" min={0} value={form.experienceYears} onChange={(e) => update({ experienceYears: parseInt(e.target.value) || 0 })} />
            <ImmediateJoiningField
              immediateJoining={form.immediateJoining}
              noticePeriod={form.noticePeriod}
              onImmediateChange={(checked) => update({ immediateJoining: checked, noticePeriod: checked ? "" : form.noticePeriod })}
              onNoticePeriodChange={(noticePeriod) => update({ noticePeriod })}
            />
            <Input label="Salary Expectation" placeholder="e.g. ₹10 LPA" value={form.salaryExpectation} onChange={(e) => update({ salaryExpectation: e.target.value })} />
            <TagInput label="Skills" value={form.skills} onChange={(skills) => update({ skills })} />
            <TagInput label="Desired Roles" value={form.desiredRoles} onChange={(desiredRoles) => update({ desiredRoles })} />
            <Textarea label="Bio" rows={4} value={form.bio} onChange={(e) => update({ bio: e.target.value })} />
            <Input label="LinkedIn URL" type="url" value={form.linkedinUrl} onChange={(e) => update({ linkedinUrl: e.target.value })} />
            <Input label="Portfolio URL" type="url" value={form.portfolioUrl} onChange={(e) => update({ portfolioUrl: e.target.value })} />

            <div>
              <p className="text-sm font-medium text-muted mb-2">Resume</p>
              <ResumeUpload showProfileUpdated />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => mutation.mutate()} isLoading={mutation.isPending}>Save Changes</Button>
              <Button variant="secondary" onClick={() => navigate("/seeker")}>Cancel</Button>
            </div>
          </GlassCard>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted">Profile completion</span>
              <span className="text-sm font-semibold text-accent">{completion}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${completion}%`, background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-cyan))" }}
              />
            </div>
            {profile?.updatedAt && (
              <p className="text-xs text-muted mt-3">Profile last updated {formatDateTime(profile.updatedAt)}</p>
            )}
          </GlassCard>
          <div>
            <p className="text-sm text-muted mb-3">Preview</p>
            <GlassCard className="sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white" style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))" }}>
                  {form.fullName.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="font-medium text-theme">{form.fullName || "Your Name"}</h3>
                  <p className="text-sm text-muted">{form.headline || "Your headline"}</p>
                </div>
              </div>
              {(noticeLabel || form.salaryExpectation) && (
                <p className="text-xs text-muted mb-3">
                  {noticeLabel}{noticeLabel && form.salaryExpectation ? " · " : ""}{form.salaryExpectation}
                </p>
              )}
              <p className="text-sm text-muted mb-4 leading-relaxed">{form.bio || "Your bio will appear here..."}</p>
              <div className="flex flex-wrap gap-1.5">
                {form.skills.map((s) => <Badge key={s} variant="green">{s}</Badge>)}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
