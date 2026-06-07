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
    <header className="animate-fade-in space-y-1.5">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {formatDate(now.toISOString())}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        <span className="text-gradient">{greeting}</span>
      </h1>
      <p className="text-base text-muted-foreground">
        One focused block at a time. Here is your day.
      </p>
    </header>
  );
}
