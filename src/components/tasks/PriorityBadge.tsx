import { Badge } from "@/components/ui/badge";
import { cn, PRIORITY_STYLES, PRIORITY_DOT } from "@/lib/utils";
import { PRIORITY_LABELS, type Priority } from "@/lib/types";

export interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2.5 py-0.5 font-medium tracking-tight transition-colors",
        PRIORITY_STYLES[priority],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full ring-2 ring-current/15",
          PRIORITY_DOT[priority]
        )}
        aria-hidden
      />
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
