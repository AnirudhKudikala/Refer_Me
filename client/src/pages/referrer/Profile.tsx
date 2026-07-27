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

export default function ReferrerProfile() {
  const { me, setMe } = useAuthStore();
  const profile = me?.referrerProfile;
  const [form, setForm] = useState({
    fullName: profile?.fullName ?? "",
    company: profile?.company ?? "",
    jobTitle: profile?.jobTitle ?? "",
    department: profile?.department ?? "",
    bio: profile?.bio ?? "",
  });
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => api.updateReferrerProfile(form),
    onSuccess: async () => {
      const updated = await api.getMe();
      setMe(updated);
      navigate("/referrer");
    },
  });

  const update = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }));

  return (
    <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold text-theme mb-6">Edit Referrer Profile</h1>
        <GlassCard className="space-y-4">
          <Input label="Full Name" value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} />
          <Input label="Company" value={form.company} onChange={(e) => update({ company: e.target.value })} />
          <Input label="Job Title" value={form.jobTitle} onChange={(e) => update({ jobTitle: e.target.value })} />
          <Input label="Department" value={form.department} onChange={(e) => update({ department: e.target.value })} />
          <Textarea label="Bio" rows={3} value={form.bio ?? ""} onChange={(e) => update({ bio: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={() => mutation.mutate()} isLoading={mutation.isPending}>Save</Button>
            <Button variant="secondary" onClick={() => navigate("/referrer")}>Cancel</Button>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
