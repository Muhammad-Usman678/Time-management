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
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
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
