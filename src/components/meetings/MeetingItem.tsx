"use client";

import { useState } from "react";
import { Pencil, Trash2, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { JoinButton } from "@/components/meetings/JoinButton";
import { MeetingFormModal } from "@/components/meetings/MeetingFormModal";
import { useDeleteMeeting } from "@/hooks/useMeetings";
import { formatMeetingWhen, toDate } from "@/lib/dates";
import { cn, LINK_LABELS } from "@/lib/utils";
import type { LinkType, Meeting } from "@/lib/types";

export interface MeetingItemProps {
  meeting: Meeting;
}

const PROVIDER_BADGE: Record<
  Exclude<LinkType, "none">,
  "default" | "secondary" | "outline"
> = {
  zoom: "default",
  meet: "default",
  custom: "outline",
};

// Tinted icon-chip color per provider, used for the leading meeting glyph.
const PROVIDER_CHIP: Record<Exclude<LinkType, "none">, string> = {
  zoom: "bg-primary/10 text-primary",
  meet: "bg-brand-2/15 text-brand-2",
  custom: "bg-accent text-accent-foreground",
};

export function MeetingItem({ meeting }: MeetingItemProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMeeting = useDeleteMeeting();

  const isPast = toDate(meeting.dateTime).getTime() < Date.now();
  const hasProvider = meeting.linkType !== "none" && Boolean(meeting.link);
  const chipClass = hasProvider
    ? PROVIDER_CHIP[meeting.linkType as Exclude<LinkType, "none">]
    : "bg-muted text-muted-foreground";

  function handleDelete() {
    deleteMeeting.mutate(meeting.id, {
      onSuccess: () => setConfirmOpen(false),
    });
  }

  return (
    <>
      <Card
        className={cn(
          "card-hover p-4",
          isPast && "opacity-60 hover:opacity-100"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("icon-chip h-10 w-10 shrink-0", chipClass)}>
            <Video size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                {meeting.title}
              </h3>
              {hasProvider && (
                <Badge
                  variant={
                    PROVIDER_BADGE[meeting.linkType as Exclude<LinkType, "none">]
                  }
                >
                  <Video size={12} />
                  {LINK_LABELS[meeting.linkType]}
                </Badge>
              )}
            </div>

            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">
                {formatMeetingWhen(meeting.dateTime)}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span>{meeting.durationMinutes} min</span>
            </p>

            {meeting.notes && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {meeting.notes}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <JoinButton meeting={meeting} />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit meeting"
              onClick={() => setEditOpen(true)}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete meeting"
              onClick={() => setConfirmOpen(true)}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </Card>

      <MeetingFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        meeting={meeting}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete meeting"
        description={`"${meeting.title}" will be permanently removed.`}
        confirmText="Delete"
        destructive
        loading={deleteMeeting.isPending}
      />
    </>
  );
}
