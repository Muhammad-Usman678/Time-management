"use client";

import { isToday, isTomorrow } from "date-fns";
import { MeetingItem } from "@/components/meetings/MeetingItem";
import { formatDate, toDate } from "@/lib/dates";
import type { Meeting } from "@/lib/types";

export interface AgendaViewProps {
  meetings: Meeting[];
}

interface DayGroup {
  key: string;
  label: string;
  meetings: Meeting[];
}

function groupLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return formatDate(date);
}

/** Bucket meetings into per-day groups, each sorted chronologically. */
function groupByDay(meetings: Meeting[]): DayGroup[] {
  const sorted = [...meetings].sort(
    (a, b) => toDate(a.dateTime).getTime() - toDate(b.dateTime).getTime()
  );

  const groups = new Map<string, DayGroup>();
  for (const meeting of sorted) {
    const date = toDate(meeting.dateTime);
    // Calendar-day key derived from local Y/M/D so meetings bucket per day.
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const existing = groups.get(key);
    if (existing) {
      existing.meetings.push(meeting);
    } else {
      groups.set(key, { key, label: groupLabel(date), meetings: [meeting] });
    }
  }

  return Array.from(groups.values());
}

export function AgendaView({ meetings }: AgendaViewProps) {
  const groups = groupByDay(meetings);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h2>
          <div className="flex flex-col gap-2">
            {group.meetings.map((meeting) => (
              <MeetingItem key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
