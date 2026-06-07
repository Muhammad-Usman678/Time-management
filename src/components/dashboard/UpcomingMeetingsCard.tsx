"use client";

import Link from "next/link";
import { CalendarClock, Video } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMeetingWhen } from "@/lib/dates";
import type { Meeting } from "@/lib/types";

export interface UpcomingMeetingsCardProps {
  meetings?: Meeting[];
  loading?: boolean;
}

/** Next few meetings with a quick join link when available. */
export function UpcomingMeetingsCard({
  meetings,
  loading,
}: UpcomingMeetingsCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-3">
          <span className="icon-chip h-9 w-9 bg-brand-2/10 text-brand-2">
            <CalendarClock size={18} />
          </span>
          <CardTitle className="text-base">Upcoming meetings</CardTitle>
        </div>
        <Link
          href="/meetings"
          className="rounded-lg px-2 py-1 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !meetings || meetings.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No upcoming meetings"
            description="Scheduled meetings will show up here."
          />
        ) : (
          <ul className="-mx-2 space-y-0.5">
            {meetings.map((meeting) => (
              <li
                key={meeting.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-secondary/60"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {meeting.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMeetingWhen(meeting.dateTime)}
                  </p>
                </div>
                {meeting.link && (
                  <a
                    href={meeting.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all duration-200 hover:bg-primary/20 active:scale-[0.98]"
                  >
                    <Video size={14} />
                    Join
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
