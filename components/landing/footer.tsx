"use client";

import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <Shield className="h-4 w-4 text-background" />
            </div>
            <span className="font-semibold">Safety API</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>API Base: safetyapi.squareweb.app</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              Operacional
            </span>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>Dashboard Administrativa para Gerenciamento de Autenticação</p>
        </div>
      </div>
    </footer>
  );
}
