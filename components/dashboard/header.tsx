"use client";

import { Bars3Icon, BellIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  onMenuClick: () => void;
  isMaintenanceMode?: boolean;
}

export function Header({
  title,
  description,
  onMenuClick,
  isMaintenanceMode = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/50 backdrop-blur-xl">
      {/* Maintenance Banner */}
      {isMaintenanceMode && (
        <div className="flex items-center justify-center gap-2 bg-warning/10 px-4 py-2 text-sm text-warning">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>Sistema em manutenção - ações administrativas bloqueadas</span>
        </div>
      )}

      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">{title}</h1>
            {description && (
              <p className="text-xs text-muted-foreground/70">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={isMaintenanceMode ? "maintenance" : "active"} />
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg border border-border/50 bg-card/50">
            <BellIcon className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          </Button>
        </div>
      </div>
    </header>
  );
}
