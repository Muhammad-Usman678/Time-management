"use client";

import { Video } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, LINK_LABELS } from "@/lib/utils";
import type { Meeting } from "@/lib/types";

export interface JoinButtonProps {
  meeting: Pick<Meeting, "link" | "linkType">;
  size?: "sm" | "default" | "lg";
  className?: string;
}

/** Primary "Join" anchor that opens the meeting link in a new tab. Hidden when no link. */
export function JoinButton({ meeting, size = "sm", className }: JoinButtonProps) {
  if (!meeting.link) return null;

  const label =
    meeting.linkType && meeting.linkType !== "none"
      ? LINK_LABELS[meeting.linkType]
      : "Join";

  return (
    <a
      href={meeting.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "default", size }), className)}
    >
      <Video size={16} />
      {label}
    </a>
  );
}
