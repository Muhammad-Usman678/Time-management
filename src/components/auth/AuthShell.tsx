"use client";

import { Zap } from "lucide-react";
import { APP_NAME } from "@/lib/app";

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full brand-gradient opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 right-0 h-[28rem] w-[28rem] rounded-full brand-gradient opacity-15 blur-3xl"
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="icon-chip h-12 w-12 brand-gradient text-white shadow-glow">
            <Zap size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gradient">
            {APP_NAME}
          </h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="glass rounded-2xl p-6 shadow-glow">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
          {children}
        </div>
        {footer && (
          <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </div>
  );
}
