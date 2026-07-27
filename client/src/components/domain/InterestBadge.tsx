import { Badge } from "../ui/Badge";

const statusMap = {
  PENDING: { label: "Pending", variant: "yellow" as const },
  ACCEPTED: { label: "Accepted", variant: "green" as const },
  DECLINED: { label: "Declined", variant: "red" as const },
};

export function InterestBadge({ status }: { status: keyof typeof statusMap }) {
  const config = statusMap[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
