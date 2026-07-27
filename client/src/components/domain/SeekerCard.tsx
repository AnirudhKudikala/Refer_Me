import { Link } from "react-router-dom";
import { MapPin, Briefcase, DollarSign, Clock, CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { InterestBadge } from "./InterestBadge";
import { fadeUp } from "../../lib/motion";
import type { SeekerCard } from "../../lib/api";
import { formatDateTime } from "../../lib/utils";

interface SeekerCardProps {
  seeker: SeekerCard;
}

export function SeekerCardComponent({ seeker }: SeekerCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <Link to={`/referrer/seekers/${seeker.id}`}>
        <GlassCard hover className="block cursor-pointer transition-shadow hover:shadow-lg hover:shadow-[var(--shadow-glow)] h-full">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))" }}
              >
                {seeker.fullName ? seeker.fullName.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-theme truncate">{seeker.fullName || "Anonymous"}</h3>
                <p className="text-sm text-muted truncate">{seeker.headline || "No headline"}</p>
              </div>
            </div>
            {seeker.interest?.status && (
              <InterestBadge status={seeker.interest.status as "PENDING" | "ACCEPTED" | "DECLINED"} />
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {seeker.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="green">{skill}</Badge>
            ))}
            {seeker.skills.length > 4 && <Badge>+{seeker.skills.length - 4}</Badge>}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            {seeker.location && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {seeker.location}</span>
            )}
            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {seeker.experienceYears}y</span>
            {(seeker.noticePeriod || seeker.immediateJoining) && (
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {seeker.noticePeriod || "Immediate"}</span>
            )}
            {seeker.salaryExpectation && (
              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {seeker.salaryExpectation}</span>
            )}
          </div>
          {seeker.profileUpdatedAt && (
            <p className="flex items-center gap-1 text-xs text-muted/80 mt-2 pt-2 border-t border-theme">
              <CalendarClock className="h-3 w-3 shrink-0" />
              Profile updated {formatDateTime(seeker.profileUpdatedAt)}
            </p>
          )}
        </GlassCard>
      </Link>
    </motion.div>
  );
}
