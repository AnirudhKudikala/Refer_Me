import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { FilterPanel, SearchBar, type SeekerFilters } from "../../components/domain/FilterPanel";
import { SeekerCardComponent } from "../../components/domain/SeekerCard";
import { SeekerCardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { staggerContainer } from "../../lib/motion";
import { api } from "../../lib/api";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuthStore } from "../../stores/authStore";

export default function ReferrerBrowse() {
  const { me } = useAuthStore();
  const [filters, setFilters] = useState<SeekerFilters>({
    skills: [], roles: [], minExp: "", maxExp: "", location: "", updatedUntil: "", interestStatus: "ALL",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedLocation = useDebounce(filters.location);

  const params: Record<string, string> = {
    page: String(page),
    limit: "10",
  };
  if (filters.skills.length) params.skills = filters.skills.join(",");
  if (filters.roles.length) params.roles = filters.roles.join(",");
  if (filters.minExp) params.minExp = filters.minExp;
  if (filters.maxExp) params.maxExp = filters.maxExp;
  if (debouncedLocation) params.location = debouncedLocation;
  if (filters.updatedUntil) params.updatedUntil = filters.updatedUntil;
  if (filters.interestStatus !== "ALL") params.interestStatus = filters.interestStatus;
  params.sort = "updated_desc";

  const { data, isLoading } = useQuery({
    queryKey: ["seekers", params],
    queryFn: () => api.getSeekers(params),
  });

  const filtered = data?.data.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || s.headline.toLowerCase().includes(q);
  });

  return (
    <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-theme">
              Browse Candidates
            </h1>
            <p className="text-muted mt-1">
              {me?.referrerProfile?.company ? `Referring at ${me.referrerProfile.company} · ` : ""}
              Sorted by newest updated
              {filters.updatedUntil ? ` · updated until ${filters.updatedUntil}` : ""}
              {data ? ` · ${data.total} candidates` : ""}
            </p>
          </div>
          <Link to="/referrer/profile">
            <Button variant="secondary" size="sm"><Settings className="h-4 w-4" /> Profile</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1 space-y-4">
            <FilterPanel filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
          </aside>

          <div className="lg:col-span-3 space-y-4">
            <SearchBar value={search} onChange={setSearch} />

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 10 }).map((_, i) => <SeekerCardSkeleton key={i} />)}
              </div>
            ) : !filtered?.length ? (
              <EmptyState
                title="No candidates found"
                description="Try adjusting your filters or check back later for new profiles."
              />
            ) : (
              <>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-2"
                >
                  {filtered.map((seeker) => (
                    <SeekerCardComponent key={seeker.id} seeker={seeker} />
                  ))}
                </motion.div>

                {data && data.totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>
                    <span className="flex items-center text-sm text-muted px-3">
                      Page {page} of {data.totalPages}
                    </span>
                    <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
