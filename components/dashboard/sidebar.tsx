"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Squares2X2Icon,
  KeyIcon,
  UsersIcon,
  CubeIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: Squares2X2Icon,
  },
  {
    name: "Licencas",
    href: "/dashboard/keys",
    icon: KeyIcon,
  },
  {
    name: "Usuarios",
    href: "/dashboard/users",
    icon: UsersIcon,
  },
  {
    name: "Produtos",
    href: "/dashboard/products",
    icon: CubeIcon,
  },
  {
    name: "Acoes em Massa",
    href: "/dashboard/bulk-actions",
    icon: RectangleStackIcon,
  },
  {
    name: "Logs",
    href: "/dashboard/logs",
    icon: DocumentTextIcon,
  },
  {
    name: "Configuracoes",
    href: "/dashboard/settings",
    icon: Cog6ToothIcon,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, admin } = useAuth();
  const isOwner = admin?.role === "OWNER";

  const navigationItems = [
    ...navigation,
    ...(isOwner
      ? [
          {
  name: "Admins",
  href: "/dashboard/admin-users",
  icon: ShieldCheckIcon,
},
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-md transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary red-glow-sm shrink-0">
              <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M50 6 L88 20 L88 52 C88 72 70 88 50 94 C30 88 12 72 12 52 L12 20 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                <text x="22" y="66" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="38" fill="white" letterSpacing="-2">RG</text>
              </svg>
            </div>
            <div>
              <span className="font-bold tracking-wide text-sidebar-foreground text-sm">RP GORDAO</span>
              <p className="text-[10px] text-sidebar-foreground/40 font-medium tracking-widest uppercase">Dashboard</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
          <p className="mb-2 mt-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Menu
          </p>
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary"
                  />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground"
                  )}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className="rounded-lg border border-sidebar-border/60 bg-sidebar-accent/20 p-3">
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">Sistema Online</span>
            </div>
            <p className="mt-0.5 text-[11px] text-sidebar-foreground/40">@RP GORDAO</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
            onClick={() => { void logout(); }}
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
