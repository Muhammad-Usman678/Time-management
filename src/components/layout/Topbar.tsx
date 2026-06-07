"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MiniTimer } from "@/components/layout/MiniTimer";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";

export interface TopbarProps {
  onMenu: () => void;
}

export function Topbar({ onMenu }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="lg:hidden"
          onClick={onMenu}
        >
          <Menu size={18} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <MiniTimer />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
