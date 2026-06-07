"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAnalytics } from "@/hooks/useAnalytics";
import { RangeSwitcher } from "@/components/analytics/RangeSwitcher";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { FocusTrendChart } from "@/components/analytics/FocusTrendChart";
import { ProductiveHoursChart } from "@/components/analytics/ProductiveHoursChart";
import { CompletionChart } from "@/components/analytics/CompletionChart";
import { TagBreakdownChart } from "@/components/analytics/TagBreakdownChart";
import type { AnalyticsRange } from "@/lib/types";

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("week");
  const { data, isLoading, isError } = useAnalytics(range);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            How your focus time and progress trend over time.
          </p>
        </div>
        <RangeSwitcher range={range} onRangeChange={setRange} />
      </div>

      {isLoading && <LoadingState />}

      {isError && !isLoading && (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={BarChart3}
              title="Couldn't load analytics"
              description="Something went wrong fetching your data. Try again in a moment."
            />
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <>
          <AnalyticsSummary data={data} />

          {data.totalSessions === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={BarChart3}
                  title="No focus sessions in this range"
                  description="Run a focus session to start building your productivity insights."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Focus time</CardTitle>
                </CardHeader>
                <CardContent>
                  <FocusTrendChart data={data.focusByDay} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most productive hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductiveHoursChart data={data.focusByHour} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <CompletionChart
                    completedTasks={data.completedTasks}
                    pendingTasks={data.pendingTasks}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Focus by tag</CardTitle>
                </CardHeader>
                <CardContent>
                  <TagBreakdownChart data={data.tagBreakdown} />
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[332px]" />
        ))}
      </div>
    </div>
  );
}
