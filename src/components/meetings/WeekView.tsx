"use client";

import { addDays, format, isSameDay, isToday, startOfWeek } from "date-fns";
import { JoinButton } from "@/components/meetings/JoinButton";
import { formatTime, toDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Meeting } from "@/lib/types";

export interface WeekViewProps {
  meetings: Meeting[];
}

export function WeekView({ meetings }: WeekViewProps) {
  // Monday-anchored current week.
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-7">
      {days.map((day) => {
        const dayMeetings = meetings
          .filter((m) => isSameDay(toDate(m.dateTime), day))
          .sort(
            (a, b) =>
              toDate(a.dateTime).getTime() - toDate(b.dateTime).getTime()
          );
        const today = isToday(day);

        return (
          <div
            key={day.toISOString()}
            className={cn(
              "flex flex-col rounded-lg border border-border bg-card p-2",
              today && "ring-2 ring-ring"
            )}
          >
            <div className="mb-2 flex items-baseline justify-between gap-1 px-1">
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  today ? "text-primary" : "text-muted-foreground"
                )}
              >
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  today ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {format(day, "M/d")}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {dayMeetings.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground/60">
                  No meetings
                </p>
              ) : (
                dayMeetings.map((meeting) => {
                  const isPast =
                    toDate(meeting.dateTime).getTime() < Date.now();
                  return (
                    <div
                      key={meeting.id}
                      className={cn(
                        "flex flex-col gap-1.5 rounded-md border border-border bg-background p-2",
                        isPast && "opacity-60"
                      )}
                    >
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {formatTime(meeting.dateTime)}
                      </span>
                      <span className="line-clamp-2 text-xs font-medium text-foreground">
                        {meeting.title}
                      </span>
                      {meeting.link && (
                        <JoinButton meeting={meeting} className="w-full" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
