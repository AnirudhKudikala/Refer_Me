import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageTransition } from "../../components/layout/PageTransition";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { TagInput } from "../../components/ui/TagInput";
import { GlassCard } from "../../components/ui/GlassCard";
import { ImmediateJoiningField } from "../../components/ui/ImmediateJoiningField";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";

const steps = ["Basic Info", "Skills & Roles", "About You"];

export default function SeekerOnboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    location: "",
    experienceYears: 0,
    noticePeriod: "",
    salaryExpectation: "",
    immediateJoining: false,
    skills: [] as string[],
    desiredRoles: [] as string[],
    bio: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setMe } = useAuthStore();

  const mutation = useMutation({
    mutationFn: () => api.updateSeekerProfile(form),
    onSuccess: async () => {
      const me = await api.getMe();
      setMe(me);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/seeker");
    },
  });

  const update = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }));

  return (
    <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {steps.map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`} />
            ))}
          </div>
          <h1 className="text-2xl font-semibold text-theme">{steps[step]}</h1>
          <p className="text-sm text-muted mt-1">Step {step + 1} of {steps.length}</p>
        </div>

        <GlassCard>
          {step === 0 && (
            <div className="space-y-4">
              <Input label="Full Name" value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} required />
              <Input label="Headline" placeholder="e.g. Full Stack Engineer" value={form.headline} onChange={(e) => update({ headline: e.target.value })} />
              <Input label="Location" placeholder="e.g. San Francisco, CA" value={form.location} onChange={(e) => update({ location: e.target.value })} />
              <Input label="Years of Experience" type="number" min={0} value={form.experienceYears} onChange={(e) => update({ experienceYears: parseInt(e.target.value) || 0 })} />
              <ImmediateJoiningField
                immediateJoining={form.immediateJoining}
                noticePeriod={form.noticePeriod}
                onImmediateChange={(checked) => update({ immediateJoining: checked, noticePeriod: checked ? "" : form.noticePeriod })}
                onNoticePeriodChange={(noticePeriod) => update({ noticePeriod })}
              />
              <Input label="Salary Expectation" placeholder="e.g. $120k – $150k" value={form.salaryExpectation} onChange={(e) => update({ salaryExpectation: e.target.value })} />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <TagInput label="Skills / Tech Stack" value={form.skills} onChange={(skills) => update({ skills })} />
              <TagInput label="Desired Roles" value={form.desiredRoles} onChange={(desiredRoles) => update({ desiredRoles })} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <Textarea label="Bio" rows={4} placeholder="Tell referrers about yourself..." value={form.bio} onChange={(e) => update({ bio: e.target.value })} />
              <Input label="LinkedIn URL" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedinUrl} onChange={(e) => update({ linkedinUrl: e.target.value })} />
              <Input label="Portfolio URL" type="url" placeholder="https://..." value={form.portfolioUrl} onChange={(e) => update({ portfolioUrl: e.target.value })} />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
            <Button className="flex-1" onClick={() => step < steps.length - 1 ? setStep(step + 1) : mutation.mutate()} isLoading={mutation.isPending}>
              {step < steps.length - 1 ? "Continue" : "Complete Profile"}
            </Button>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
