"use client";

import { useState } from "react";
import { CalendarDays, LayoutList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import {
  MeetingList,
  type MeetingViewMode,
} from "@/components/meetings/MeetingList";
import { MeetingFormModal } from "@/components/meetings/MeetingFormModal";
import { useMeetings } from "@/hooks/useMeetings";

const VIEW_TABS = [
  { value: "agenda", label: "Agenda", icon: LayoutList },
  { value: "week", label: "Week", icon: CalendarDays },
];

export default function MeetingsPage() {
  const [view, setView] = useState<MeetingViewMode>("agenda");
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading, isError } = useMeetings();

  return (
    <div className="mx-auto flex w-full max-w-5xl animate-fade-in flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="icon-chip h-11 w-11 shrink-0 bg-primary/10 text-primary">
            <CalendarDays size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              <span className="text-gradient">Meetings</span>
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Keep your syncs, seminars, and calls in one calm place — with
              one-click join links.
            </p>
          </div>
        </div>
        <Button onClick={() => setFormOpen(true)} className="shrink-0">
          <Plus size={16} />
          New Meeting
        </Button>
      </div>

      <Tabs
        tabs={VIEW_TABS}
        value={view}
        onValueChange={(v) => setView(v as MeetingViewMode)}
        className="self-start"
      />

      <MeetingList
        meetings={data}
        isLoading={isLoading}
        isError={isError}
        view={view}
        onNew={() => setFormOpen(true)}
      />

      <MeetingFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
