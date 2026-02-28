"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Key, RotateCcw, Pause, Play, Ban, Link2Off, Plus, Minus, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AuditAction =
  | "reset_hwid"
  | "unlink"
  | "add_days"
  | "remove_days"
  | "pause"
  | "unpause"
  | "ban"
  | "unban"
  | "maintenance_on"
  | "maintenance_off"
  | "bulk_pause"
  | "bulk_reset";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  target?: string;
  details?: string;
  timestamp: Date;
}

const actionConfig: Record<
  AuditAction,
  { label: string; icon: LucideIcon; color: string }
> = {
  reset_hwid: {
    label: "HWID Resetado",
    icon: RotateCcw,
    color: "text-blue-400",
  },
  unlink: {
    label: "Key Desvinculada",
    icon: Link2Off,
    color: "text-amber-400",
  },
  add_days: {
    label: "Dias Adicionados",
    icon: Plus,
    color: "text-emerald-400",
  },
  remove_days: {
    label: "Dias Removidos",
    icon: Minus,
    color: "text-red-400",
  },
  pause: {
    label: "Key Pausada",
    icon: Pause,
    color: "text-amber-400",
  },
  unpause: {
    label: "Key Despausada",
    icon: Play,
    color: "text-emerald-400",
  },
  ban: {
    label: "Key Banida",
    icon: Ban,
    color: "text-red-400",
  },
  unban: {
    label: "Key Desbanida",
    icon: Key,
    color: "text-emerald-400",
  },
  maintenance_on: {
    label: "Manutencao Ativada",
    icon: Settings,
    color: "text-amber-400",
  },
  maintenance_off: {
    label: "Manutencao Desativada",
    icon: Settings,
    color: "text-emerald-400",
  },
  bulk_pause: {
    label: "Pausa em Massa",
    icon: Pause,
    color: "text-amber-400",
  },
  bulk_reset: {
    label: "Reset em Massa",
    icon: RotateCcw,
    color: "text-blue-400",
  },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "agora mesmo";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atras`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}h atras`;
  return `${Math.floor(diffInSeconds / 86400)}d atras`;
}

interface AuditLogProps {
  entries: AuditLogEntry[];
  maxEntries?: number;
  className?: string;
}

export function AuditLog({ entries, maxEntries = 10, className }: AuditLogProps) {
  const [visibleEntries, setVisibleEntries] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    setVisibleEntries(entries.slice(0, maxEntries));
  }, [entries, maxEntries]);

  return (
    <div className={cn("space-y-3", className)}>
      {visibleEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma atividade recente
        </p>
      ) : (
        visibleEntries.map((entry, index) => {
          const config = actionConfig[entry.action];
          const Icon = config.icon;

          return (
            <div
              key={entry.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3 transition-all",
                "animate-slide-up opacity-0"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50",
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">
                    {entry.details || config.label}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatTimeAgo(entry.timestamp)}
                  </span>
                </div>
                {entry.target && (
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                    {entry.target}
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// Hook for managing audit log state
export function useAuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);

  const addEntry = (
    action: AuditAction,
    target?: string,
    details?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      target,
      details,
      timestamp: new Date(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  const clearEntries = () => setEntries([]);

  return { entries, addEntry, clearEntries };
}
