"use client";

import { formatDate } from "@/lib/dates";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Time-aware greeting, today's date, and a calm motivational subtitle. */
export function GreetingHeader() {
  const now = new Date();
  const greeting = greetingFor(now.getHours());

  return (
    <header className="space-y-1">
      <p className="text-sm text-muted-foreground">
        {formatDate(now.toISOString())}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
      <p className="text-sm text-muted-foreground">
        One focused block at a time. Here is your day.
      </p>
    </header>
  );
}
