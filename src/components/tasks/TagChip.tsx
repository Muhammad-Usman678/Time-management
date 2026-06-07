"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/types";

export interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
  className?: string;
}

export function TagChip({ tag, onRemove, className }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        // Subtle tint of the tag color so chips read in light + dark mode.
        backgroundColor: `${tag.color}1f`,
        borderColor: `${tag.color}59`,
        color: tag.color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: tag.color }}
        aria-hidden
      />
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${tag.name}`}
          className="-mr-0.5 ml-0.5 inline-flex items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
