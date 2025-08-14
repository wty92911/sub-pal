import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SubscriptionStatus = "Active" | "paused" | "cancelled" | "trial";

interface StatusBadgeProps {
  status: SubscriptionStatus;
}

const statusConfig = {
  active: { color: "bg-green-100 text-green-800 hover:bg-green-200", label: "Active" },
  paused: { color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200", label: "Paused" },
  cancelled: { color: "bg-red-100 text-red-800 hover:bg-red-200", label: "Cancelled" },
  trial: { color: "bg-blue-100 text-blue-800 hover:bg-blue-200", label: "Trial" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn("font-medium", config.color)}>
      {config.label}
    </Badge>
  );
}
