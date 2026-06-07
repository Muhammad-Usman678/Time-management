"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

export function UserMenu() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full brand-gradient text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:shadow-glow hover:brightness-105 active:scale-[0.98]"
      >
        {initial}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl p-1 shadow-glow animate-scale-in">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">
                {user.name ?? "Account"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <LogOut size={16} />
              {logout.isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
