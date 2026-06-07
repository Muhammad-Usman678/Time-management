"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface StatTileProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  sublabel?: string;
  /** Tailwind classes for the icon chip tint (bg + text). Defaults to primary. */
  accent?: string;
}

/** Compact metric card: muted label, large value, optional icon + sublabel. */
export function StatTile({
  label,
  value,
  icon: Icon,
  sublabel,
  accent = "bg-primary/10 text-primary",
}: StatTileProps) {
  return (
    <Card className="card-hover">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {sublabel && (
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          )}
        </div>
        {Icon && (
          <div className={`icon-chip h-10 w-10 shrink-0 ${accent}`}>
            <Icon size={20} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
