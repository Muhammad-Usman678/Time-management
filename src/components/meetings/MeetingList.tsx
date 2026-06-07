"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AgendaView } from "@/components/meetings/AgendaView";
import { WeekView } from "@/components/meetings/WeekView";
import type { Meeting } from "@/lib/types";

export type MeetingViewMode = "agenda" | "week";

export interface MeetingListProps {
  meetings: Meeting[] | undefined;
  isLoading: boolean;
  isError: boolean;
  view: MeetingViewMode;
  onNew: () => void;
}

export function MeetingList({
  meetings,
  isLoading,
  isError,
  view,
  onNew,
}: MeetingListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-soft"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded-md" />
              <Skeleton className="h-3 w-3/4 rounded-md" />
            </div>
            <Skeleton className="h-8 w-16 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Couldn't load meetings"
        description="Something went wrong while fetching your meetings. Try again."
      />
    );
  }

  if (!meetings || meetings.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No meetings scheduled"
        description="Plan your advisor syncs, seminars, and calls. They'll show up here with one-click join links."
        action={<Button onClick={onNew}>Schedule a meeting</Button>}
      />
    );
  }

  return view === "week" ? (
    <WeekView meetings={meetings} />
  ) : (
    <AgendaView meetings={meetings} />
  );
}
