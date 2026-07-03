"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "../layout";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ClockIcon,
  GlobeAltIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { getAuditLogs, type AuditLogItem } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

function safeDateString(v: unknown) {
  if (!v) return "—";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function relativeTime(v: unknown) {
  if (!v) return "—";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

const LEVEL_CONFIG = {
  ERROR: { dot: "bg-red-500",   badge: "text-red-400 bg-red-500/10",    border: "border-l-red-500/50"   },
  WARN:  { dot: "bg-amber-400", badge: "text-amber-400 bg-amber-400/10", border: "border-l-amber-500/40" },
  INFO:  { dot: "bg-blue-400",  badge: "text-blue-400 bg-blue-400/10",   border: "border-l-blue-500/30"  },
};

const METHOD_CONFIG: Record<string, string> = {
  GET:    "text-blue-400",
  POST:   "text-green-400",
  PUT:    "text-amber-400",
  DELETE: "text-red-400",
  PATCH:  "text-purple-400",
};

const STATUS_COLOR = (code: number) => {
  if (code >= 500) return "text-red-400";
  if (code >= 400) return "text-orange-400";
  if (code >= 300) return "text-yellow-400";
  return "text-green-400";
};

export default function AuditLogsPage() {
  const { toggle: toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getAuditLogs(page, 25, {
        q: searchQuery || undefined,
        level: levelFilter || undefined,
        method: methodFilter || undefined,
      });
      if (res?.success && res?.data) {
        setLogs(Array.isArray(res.data.items) ? res.data.items : []);
        setTotalPages(res.data.pages ?? 1);
        setTotal(res.data.total ?? 0);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, searchQuery, levelFilter, methodFilter]);

  useEffect(() => { void fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!live) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => void fetchLogs(true), 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [live, fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const clearFilters = () => {
    setLevelFilter(""); setMethodFilter(""); setSearchInput(""); setSearchQuery(""); setPage(1);
  };

  const hasFilters = levelFilter || methodFilter || searchQuery;

  return (
    <div className="min-h-screen">
      <Header title="Audit Logs" description="Historico de eventos e acoes do sistema" onMenuClick={toggleSidebar} />

      <main className="p-4 lg:p-6 space-y-4">

        {/* Toolbar */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="flex flex-col gap-3">

          {/* Search row */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por evento, rota, requestId..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 bg-white/[0.03] border-white/8 h-10 text-sm placeholder:text-muted-foreground/50"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); setSearchQuery(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={loading} className="h-10 bg-primary hover:bg-primary/90 px-5">
              Buscar
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowFilters(!showFilters)}
              className={`h-10 w-10 p-0 border border-white/8 ${showFilters ? "bg-white/8 text-foreground" : "bg-white/[0.03] text-muted-foreground"}`}>
              <FunnelIcon className="h-4 w-4" />
            </Button>
          </form>

          {/* Filter dropdowns */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-2 overflow-hidden">
                <select value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                  className="h-9 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-sm text-foreground appearance-none">
                  <option value="">Level: Todos</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
                <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
                  className="h-9 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-sm text-foreground appearance-none">
                  <option value="">Método: Todos</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{total}</span> registro(s)
            </span>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                <XMarkIcon className="h-3 w-3" />
                Limpar filtros
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLive(v => !v)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${live ? "bg-green-500/15 text-green-400" : "bg-white/5 text-muted-foreground"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
              {live ? "Live (10s)" : "Live"}
            </button>
            <Button variant="ghost" size="sm" onClick={() => void fetchLogs()} disabled={loading}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-white/8 bg-white/[0.03]">
              <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Logs list */}
        {loading && logs.length === 0 ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="h-14 rounded-lg bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <DocumentTextIcon className="h-10 w-10 opacity-20 mb-3" />
            <p className="text-sm">Nenhum log encontrado</p>
          </motion.div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log, i) => {
              const id = String(log._id ?? log.requestId ?? i);
              const level = (log as any).level as "ERROR" | "WARN" | "INFO";
              const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.INFO;
              const statusCode = Number((log as any).statusCode ?? 0);
              const latency = Number((log as any).latencyMs ?? 0);
              const isExpanded = expandedId === id;

              return (
                <motion.div key={id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
                >
                  {/* Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : id)}
                    className={`group relative rounded-lg border-l-2 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all duration-200 ${cfg.border} ${isExpanded ? "bg-white/[0.04]" : ""}`}
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Level dot */}
                      <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${cfg.badge}`}>
                          {level}
                        </span>
                        <span className={`font-mono text-[10px] font-bold ${METHOD_CONFIG[(log as any).method] ?? "text-muted-foreground"}`}>
                          {(log as any).method}
                        </span>
                      </div>

                      {/* Event + message */}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate block">
                          {(log as any).event ?? "—"}
                          {(log as any).message ? <span className="font-normal text-muted-foreground/70"> — {(log as any).message}</span> : null}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 font-mono truncate block">
                          {(log as any).route ?? ""}
                        </span>
                      </div>

                      {/* Status + latency + time */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0 text-right">
                        <span className={`font-mono text-xs font-bold ${STATUS_COLOR(statusCode)}`}>
                          {statusCode || "—"}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60 font-mono">
                          {latency > 0 ? `${latency.toFixed(0)}ms` : "—"}
                        </span>
                        <span className="text-[11px] text-muted-foreground/50 w-20 text-right">
                          {relativeTime((log as any).createdAt)}
                        </span>
                      </div>

                      {/* Expand icon */}
                      <ChevronDownIcon className={`h-3.5 w-3.5 text-muted-foreground/40 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-white/5 mx-4 mb-3">
                          <div className="pt-3 grid gap-3 sm:grid-cols-2 text-xs">
                            <Field label="Request ID" value={(log as any).requestId} mono />
                            <Field label="IP" value={(log as any).ip} mono icon={<GlobeAltIcon className="h-3 w-3" />} />
                            <Field label="Timestamp" value={safeDateString((log as any).createdAt)} mono icon={<ClockIcon className="h-3 w-3" />} />
                            {(log as any).keyMasked && <Field label="Key" value={(log as any).keyMasked} mono />}
                            {(log as any).discordIdMasked && <Field label="Discord ID" value={(log as any).discordIdMasked} mono />}
                            {(log as any).hwidMasked && <Field label="HWID" value={(log as any).hwidMasked} mono />}
                            {(log as any).userAgent && (
                              <div className="sm:col-span-2">
                                <p className="text-muted-foreground mb-1">User Agent</p>
                                <p className="font-mono text-[11px] text-foreground/70 break-all">{(log as any).userAgent}</p>
                              </div>
                            )}
                            {(log as any).meta && Object.keys((log as any).meta).length > 0 && (
                              <div className="sm:col-span-2">
                                <p className="text-muted-foreground mb-1">Meta</p>
                                <pre className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-[11px] font-mono overflow-x-auto text-foreground/70">
                                  {JSON.stringify((log as any).meta, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}
              className="h-8 gap-1 text-xs border border-white/8 bg-white/[0.03]">
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                    {p}
                  </button>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}
              className="h-8 gap-1 text-xs border border-white/8 bg-white/[0.03]">
              Proxima
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}

      </main>
    </div>
  );
}

function Field({ label, value, mono, icon }: { label: string; value?: string | null; mono?: boolean; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className={`${mono ? "font-mono" : ""} text-[11px] text-foreground/80 flex items-center gap-1`}>
        {icon}
        {value}
      </p>
    </div>
  );
}
