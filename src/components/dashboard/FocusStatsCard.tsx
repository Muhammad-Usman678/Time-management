"use client";

import { CheckCircle2, Flame, Timer, Zap } from "lucide-react";
import { StatTile } from "@/components/dashboard/StatTile";
import { formatDuration } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";

export interface FocusStatsCardProps {
  stats: DashboardStats;
}

/** Row of summary stat tiles derived from the dashboard stats payload. */
export function FocusStatsCard({ stats }: FocusStatsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Focus today"
        value={formatDuration(stats.todayFocusSeconds)}
        icon={Timer}
        accent="bg-primary/10 text-primary"
      />
      <StatTile
        label="Focus this week"
        value={formatDuration(stats.weekFocusSeconds)}
        icon={Flame}
        accent="bg-brand-2/10 text-brand-2"
      />
      <StatTile
        label="Sessions today"
        value={stats.todaySessions}
        icon={Zap}
        accent="bg-warning/10 text-warning"
      />
      <StatTile
        label="Tasks today"
        value={`${stats.todayCompleted} done`}
        icon={CheckCircle2}
        sublabel={`${stats.todayPending} pending`}
        accent="bg-success/10 text-success"
      />
    </div>
  );
}
