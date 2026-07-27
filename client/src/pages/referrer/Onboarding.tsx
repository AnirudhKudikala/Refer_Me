import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { PageTransition } from "../../components/layout/PageTransition";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";

export default function ReferrerOnboarding() {
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    jobTitle: "",
    department: "",
    bio: "",
  });
  const navigate = useNavigate();
  const { setMe } = useAuthStore();

  const mutation = useMutation({
    mutationFn: () => api.updateReferrerProfile(form),
    onSuccess: async () => {
      const me = await api.getMe();
      setMe(me);
      navigate("/referrer");
    },
  });

  const update = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }));

  return (
    <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold text-theme mb-2">Set up your referrer profile</h1>
        <p className="text-sm text-muted mb-8">Tell candidates about yourself and your company.</p>
        <GlassCard className="space-y-4">
          <Input label="Full Name" value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} required />
          <Input label="Company" value={form.company} onChange={(e) => update({ company: e.target.value })} required />
          <Input label="Job Title" value={form.jobTitle} onChange={(e) => update({ jobTitle: e.target.value })} required />
          <Input label="Department" value={form.department} onChange={(e) => update({ department: e.target.value })} />
          <Textarea label="Bio" rows={3} placeholder="Optional intro about yourself..." value={form.bio} onChange={(e) => update({ bio: e.target.value })} />
          <Button className="w-full" onClick={() => mutation.mutate()} isLoading={mutation.isPending}>Complete Setup</Button>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
