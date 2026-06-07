"use client";

import { CheckCircle2, Clock, ListTodo, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { AnalyticsData } from "@/lib/types";

export interface AnalyticsSummaryProps {
  data: AnalyticsData;
}

// Small inline stat tile — defined here so analytics owns no dashboard imports.
function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        icon={Clock}
        label="Total focus time"
        value={formatDuration(data.totalFocusSeconds)}
      />
      <StatTile
        icon={Timer}
        label="Focus sessions"
        value={String(data.totalSessions)}
      />
      <StatTile
        icon={CheckCircle2}
        label="Completed tasks"
        value={String(data.completedTasks)}
      />
      <StatTile
        icon={ListTodo}
        label="Pending tasks"
        value={String(data.pendingTasks)}
      />
    </div>
  );
}
