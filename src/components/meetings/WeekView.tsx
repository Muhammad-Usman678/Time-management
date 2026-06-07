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
              "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-200",
              today && "ring-2 ring-ring/60 shadow-glow"
            )}
          >
            <div
              className={cn(
                "flex items-baseline justify-between gap-1 border-b border-border/70 px-3 py-2",
                today
                  ? "brand-gradient text-primary-foreground"
                  : "bg-secondary/40"
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  today ? "text-primary-foreground/90" : "text-muted-foreground"
                )}
              >
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  today ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {format(day, "M/d")}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-2">
              {dayMeetings.length === 0 ? (
                <p className="px-1 py-3 text-center text-xs text-muted-foreground/50">
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
                        "group flex flex-col gap-1.5 rounded-lg border border-border bg-background p-2 transition-all duration-200 hover:border-primary/40 hover:shadow-soft",
                        isPast && "opacity-60 hover:opacity-100"
                      )}
                    >
                      <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary">
                        {formatTime(meeting.dateTime)}
                      </span>
                      <span className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
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
