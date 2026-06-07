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
      className={cn(PRIORITY_STYLES[priority], className)}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[priority])}
        aria-hidden
      />
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
