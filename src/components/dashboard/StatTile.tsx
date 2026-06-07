"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface StatTileProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  sublabel?: string;
}

/** Compact metric card: muted label, large value, optional icon + sublabel. */
export function StatTile({ label, value, icon: Icon, sublabel }: StatTileProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {sublabel && (
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
            <Icon size={18} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
