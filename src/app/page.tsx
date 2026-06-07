"use client";

import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { FocusStatsCard } from "@/components/dashboard/FocusStatsCard";
import { ActiveTimerCard } from "@/components/dashboard/ActiveTimerCard";
import { TodayTasksCard } from "@/components/dashboard/TodayTasksCard";
import { UpcomingMeetingsCard } from "@/components/dashboard/UpcomingMeetingsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="space-y-8">
      <GreetingHeader />

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <FocusStatsCard stats={data.stats} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayTasksCard tasks={data?.todayTasks} loading={isLoading} />
        </div>
        <div className="space-y-6">
          <ActiveTimerCard />
          <UpcomingMeetingsCard
            meetings={data?.upcomingMeetings}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
