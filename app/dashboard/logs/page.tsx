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
  BoltIcon,
} from "@heroicons/react/24/solid";
import { getAuditLogs, type AuditLogItem } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

function relativeTime(v: unknown) {
  if (!v) return "—";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s atrás`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

function safeDateFull(v: unknown) {
  if (!v) return "—";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const LEVEL_CONFIG = {
  ERROR: { dot: "#ef4444", badge: "text-red-400 bg-red-500/10 border border-red-500/20",    bar: "bg-red-500",   label: "ERR" },
  WARN:  { dot: "#f59e0b", badge: "text-amber-400 bg-amber-400/10 border border-amber-500/20", bar: "bg-amber-400", label: "WRN" },
  INFO:  { dot: "#60a5fa", badge: "text-blue-400 bg-blue-400/10 border border-blue-500/20",    bar: "bg-blue-500",  label: "INF" },
};

const METHOD_COLORS: Record<string, string> = {
  GET: "#60a5fa", POST: "#34d399", PUT: "#fbbf24", DELETE: "#f87171", PATCH: "#c084fc",
};

const STATUS_COLOR = (c: number) => c >= 500 ? "#f87171" : c >= 400 ? "#fb923c" : c >= 300 ? "#fbbf24" : "#34d399";

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
  const [newCount, setNewCount] = useState(0);
  const [levelCounts, setLevelCounts] = useState({ ERROR: 0, WARN: 0, INFO: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevTotalRef = useRef(0);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getAuditLogs(page, 25, {
        q: searchQuery || undefined,
        level: levelFilter || undefined,
        method: methodFilter || undefined,
      });
      if (res?.success && res?.data) {
        const items = Array.isArray(res.data.items) ? res.data.items : [];
        setLogs(items);
        setTotalPages(res.data.pages ?? 1);
        setTotal(res.data.total ?? 0);

        // Count levels
        const counts = { ERROR: 0, WARN: 0, INFO: 0 };
        items.forEach(l => {
          const lvl = (l as any).level as "ERROR" | "WARN" | "INFO";
          if (lvl in counts) counts[lvl]++;
        });
        setLevelCounts(counts);

        // Detect new logs when live
        if (silent && prevTotalRef.current > 0 && (res.data.total ?? 0) > prevTotalRef.current) {
          setNewCount(n => n + ((res.data.total ?? 0) - prevTotalRef.current));
        }
        prevTotalRef.current = res.data.total ?? 0;
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, searchQuery, levelFilter, methodFilter]);

  useEffect(() => { void fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!live) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => void fetchLogs(true), 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [live, fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); setPage(1); setSearchQuery(searchInput);
  };

  const hasFilters = levelFilter || methodFilter || searchQuery;

  return (
    <div className="min-h-screen">
      <Header title="Audit Logs" description="Historico de eventos e acoes do sistema" onMenuClick={toggleSidebar} />

      <main className="p-4 lg:p-6 space-y-4">

        {/* Level counters strip */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="grid grid-cols-3 gap-3">
          {(["ERROR", "WARN", "INFO"] as const).map((lvl) => {
            const cfg = LEVEL_CONFIG[lvl];
            return (
              <button key={lvl} onClick={() => { setLevelFilter(l => l === lvl ? "" : lvl); setPage(1); }}
                className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 hover:scale-[1.01] ${levelFilter === lvl ? "border-white/15 bg-white/[0.06]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                <div className="absolute top-0 left-0 h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${cfg.dot}, transparent)` }} />
                <p className="text-2xl font-bold tabular-nums" style={{ color: cfg.dot }}>{levelCounts[lvl]}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">{lvl}</p>
                <div className={`absolute bottom-0 right-0 h-12 w-12 rounded-full blur-2xl opacity-20`} style={{ background: cfg.dot }} />
              </button>
            );
          })}
        </motion.div>

        {/* Search + controls */}
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
          className="space-y-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input placeholder="Buscar por evento, rota, requestId, mensagem..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)}
                className="pl-9 h-10 bg-white/[0.03] border-white/8 text-sm placeholder:text-muted-foreground/40 focus-visible:ring-primary/30" />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); setSearchQuery(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={loading} className="h-10 px-5 bg-primary hover:bg-primary/90">Buscar</Button>
            <Button type="button" variant="ghost" onClick={() => setShowFilters(!showFilters)}
              className={`h-10 w-10 p-0 border transition-colors ${showFilters ? "border-primary/40 bg-primary/10 text-primary" : "border-white/8 bg-white/[0.03] text-muted-foreground hover:text-foreground"}`}>
              <FunnelIcon className="h-4 w-4" />
            </Button>
          </form>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                className="overflow-hidden">
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: "Level", value: levelFilter, onChange: setLevelFilter, options: ["INFO", "WARN", "ERROR"] },
                    { label: "Método", value: methodFilter, onChange: setMethodFilter, options: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
                  ].map(({ label, value, onChange, options }) => (
                    <select key={label} value={value} onChange={e => { onChange(e.target.value); setPage(1); }}
                      className="h-9 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-sm text-foreground appearance-none cursor-pointer">
                      <option value="">{label}: Todos</option>
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm">
              <span className="font-bold text-foreground">{total}</span>
              <span className="text-muted-foreground"> registro(s)</span>
            </span>
            {hasFilters && (
              <button onClick={() => { setLevelFilter(""); setMethodFilter(""); setSearchInput(""); setSearchQuery(""); setPage(1); }}
                className="flex items-center gap-1 text-xs text-primary/80 hover:text-primary transition-colors">
                <XMarkIcon className="h-3 w-3" /> Limpar filtros
              </button>
            )}
            {newCount > 0 && live && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => { setNewCount(0); void fetchLogs(); }}
                className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-xs text-green-400 font-medium">
                <BoltIcon className="h-3 w-3" />
                {newCount} novo(s)
              </motion.button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setLive(v => !v); setNewCount(0); }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${live ? "bg-green-500/15 text-green-400 shadow-[0_0_12px_rgba(74,222,128,0.15)]" : "bg-white/5 text-muted-foreground hover:text-foreground"}`}>
              <span className={`h-1.5 w-1.5 rounded-full transition-all ${live ? "bg-green-400 animate-pulse shadow-[0_0_6px_#4ade80]" : "bg-gray-500"}`} />
              {live ? "Live · 8s" : "Live off"}
            </button>
            <Button variant="ghost" size="sm" onClick={() => void fetchLogs()} disabled={loading}
              className="h-8 gap-1.5 text-xs border border-white/8 bg-white/[0.02] text-muted-foreground hover:text-foreground">
              <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Logs */}
        {loading && logs.length === 0 ? (
          <div className="space-y-1.5">
            {[...Array(10)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="h-[52px] rounded-lg bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24">
            <DocumentTextIcon className="h-12 w-12 text-white/10 mb-4" />
            <p className="text-sm text-muted-foreground/60">Nenhum log encontrado</p>
            {hasFilters && <button onClick={() => { setLevelFilter(""); setMethodFilter(""); setSearchQuery(""); setSearchInput(""); }} className="mt-2 text-xs text-primary hover:text-primary/80">Limpar filtros</button>}
          </motion.div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => {
              const id = String((log as any)._id ?? log.requestId ?? i);
              const level = ((log as any).level ?? "INFO") as "ERROR" | "WARN" | "INFO";
              const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.INFO;
              const method = (log as any).method ?? "";
              const statusCode = Number((log as any).statusCode ?? 0);
              const latency = Number((log as any).latencyMs ?? 0);
              const isExpanded = expandedId === id;

              return (
                <motion.div key={id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.35) }}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : id)}
                    className={`group relative rounded-lg cursor-pointer transition-all duration-150 overflow-hidden ${isExpanded ? "ring-1 ring-white/10" : "hover:ring-1 hover:ring-white/5"}`}
                    style={{ background: isExpanded ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)" }}
                  >
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ background: cfg.dot, opacity: isExpanded ? 1 : 0.5 }} />

                    {/* Main row */}
                    <div className="flex items-center gap-3 pl-5 pr-4 py-3">
                      {/* Level badge */}
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black tracking-widest uppercase ${cfg.badge}`}>
                        {cfg.label}
                      </span>

                      {/* Method */}
                      <span className="shrink-0 font-mono text-[11px] font-black" style={{ color: METHOD_COLORS[method] ?? "#9ca3af" }}>
                        {method}
                      </span>

                      {/* Event + message */}
                      <div className="flex-1 min-w-0 flex items-baseline gap-2">
                        <span className="text-[13px] font-semibold text-foreground/90 shrink-0 truncate max-w-[200px] lg:max-w-xs">
                          {(log as any).event ?? "—"}
                        </span>
                        {(log as any).message && (
                          <span className="text-xs text-muted-foreground/60 truncate hidden sm:block">
                            {(log as any).message}
                          </span>
                        )}
                      </div>

                      {/* Right side */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <span className="font-mono text-xs font-bold" style={{ color: STATUS_COLOR(statusCode) }}>
                          {statusCode || "—"}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground/50 w-14 text-right">
                          {latency > 0 ? `${latency.toFixed(0)}ms` : "—"}
                        </span>
                        <span className="text-[11px] text-muted-foreground/40 w-20 text-right tabular-nums">
                          {relativeTime((log as any).createdAt)}
                        </span>
                      </div>

                      <ChevronDownIcon className={`h-3.5 w-3.5 text-muted-foreground/30 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180 text-muted-foreground/60" : ""}`} />
                    </div>

                    {/* Route subtitle */}
                    {(log as any).route && !isExpanded && (
                      <p className="pl-5 pb-1.5 font-mono text-[10px] text-muted-foreground/30 truncate pr-4">
                        {(log as any).route}
                      </p>
                    )}

                    {/* Expanded */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="mx-4 mb-4 mt-1 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                            <div className="grid gap-4 sm:grid-cols-3 text-xs mb-4">
                              <DetailField icon={<ClockIcon className="h-3 w-3" />} label="Timestamp" value={safeDateFull((log as any).createdAt)} />
                              <DetailField icon={<GlobeAltIcon className="h-3 w-3" />} label="IP" value={(log as any).ip} />
                              <DetailField label="Request ID" value={(log as any).requestId} mono truncate />
                              <DetailField label="Rota" value={(log as any).route} mono />
                              {(log as any).keyMasked && <DetailField label="Key" value={(log as any).keyMasked} mono />}
                              {(log as any).discordIdMasked && <DetailField label="Discord ID" value={(log as any).discordIdMasked} mono />}
                              {(log as any).hwidMasked && <DetailField label="HWID" value={(log as any).hwidMasked} mono />}
                            </div>

                            {(log as any).userAgent && (
                              <div className="mb-3 pb-3 border-b border-white/5">
                                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1">User Agent</p>
                                <p className="font-mono text-[11px] text-muted-foreground/70 break-all">{(log as any).userAgent}</p>
                              </div>
                            )}

                            {(log as any).meta && Object.keys((log as any).meta).length > 0 && (
                              <div>
                                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-2">Meta</p>
                                <pre className="rounded-lg bg-black/30 border border-white/5 p-3 text-[11px] font-mono text-green-400/80 overflow-x-auto leading-relaxed">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-1.5 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}
              className="h-8 w-8 p-0 border border-white/8 bg-white/[0.02] text-muted-foreground">
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            {(() => {
              const pages: (number | "...")[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (page > 3) pages.push("...");
                for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                if (page < totalPages - 2) pages.push("...");
                pages.push(totalPages);
              }
              return pages.map((p, i) => p === "..." ? (
                <span key={`e${i}`} className="w-8 text-center text-xs text-muted-foreground/40">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p as number)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${p === page ? "bg-primary text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                  {p}
                </button>
              ));
            })()}

            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}
              className="h-8 w-8 p-0 border border-white/8 bg-white/[0.02] text-muted-foreground">
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

      </main>
    </div>
  );
}

function DetailField({ label, value, mono, icon, truncate }: { label: string; value?: string | null; mono?: boolean; icon?: React.ReactNode; truncate?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1 flex items-center gap-1">
        {icon}{label}
      </p>
      <p className={`${mono ? "font-mono" : ""} text-[11px] text-foreground/75 ${truncate ? "truncate" : "break-all"}`}>
        {value}
      </p>
    </div>
  );
}
