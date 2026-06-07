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
  iconClassName = "bg-primary/10 text-primary",
  gradient = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  iconClassName?: string;
  gradient?: boolean;
}) {
  return (
    <div className="card-hover group flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-soft">
      <div
        className={`icon-chip h-11 w-11 shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconClassName}`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={`truncate text-2xl font-semibold tracking-tight ${
            gradient ? "text-gradient" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile
        icon={Clock}
        label="Total focus time"
        value={formatDuration(data.totalFocusSeconds)}
        iconClassName="bg-primary/10 text-primary"
        gradient
      />
      <StatTile
        icon={Timer}
        label="Focus sessions"
        value={String(data.totalSessions)}
        iconClassName="bg-accent text-accent-foreground"
      />
      <StatTile
        icon={CheckCircle2}
        label="Completed tasks"
        value={String(data.completedTasks)}
        iconClassName="bg-success/10 text-success"
      />
      <StatTile
        icon={ListTodo}
        label="Pending tasks"
        value={String(data.pendingTasks)}
        iconClassName="bg-muted text-muted-foreground"
      />
    </div>
  );
}
