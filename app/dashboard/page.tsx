"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { useSidebar } from "./layout";
import { StatsCard } from "@/components/ui/stats-card";
import {
  KeyIcon as Key, UsersIcon as Users, CubeIcon as Package,
  CheckCircleIcon as CheckCircle, SignalIcon as Activity,
  ArrowTrendingUpIcon as TrendingUp, NoSymbolIcon as Ban,
  PauseIcon as Pause, ClockIcon as Clock, ShieldExclamationIcon as ShieldAlert,
  ArrowPathIcon as RefreshCw, ExclamationTriangleIcon as AlertTriangle,
  ShieldCheckIcon, UserGroupIcon, LockClosedIcon, BoltIcon,
  ChartBarIcon, GlobeAltIcon,
} from "@heroicons/react/24/solid";
import {
  getOverview, getAuditLogs, getAlerts, getTopProducts, getKeysGrowth,
  getSuspiciousIPs, getFailedLogins, getActiveSessions,
  type OverviewData, type AuditLogItem, type SystemAlert,
  type TopProduct, type KeyGrowthItem, type SuspiciousIP, type ActiveSession,
} from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { AuditLog, type AuditLogEntry, type AuditAction } from "@/components/dashboard/audit-log";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChartContainer } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth-context";

interface ExtendedStats extends OverviewData {
  bannedKeys: number; pausedKeys: number; expiredKeys: number; pendingKeys: number; expiringSoon: number;
}

function mapEventToAction(event: string, level: string): AuditAction {
  const e = event.toLowerCase();
  if (e.includes("hwid") && e.includes("reset")) return "reset_hwid";
  if (e.includes("unlink")) return "unlink";
  if (e.includes("add") && e.includes("day")) return "add_days";
  if (e.includes("unpause")) return "unpause";
  if (e.includes("pause")) return "pause";
  if (e.includes("unban")) return "unban";
  if (e.includes("ban")) return "ban";
  if (e.includes("maintenance")) return level === "INFO" ? "maintenance_off" : "maintenance_on";
  if (level === "ERROR") return "ban";
  if (level === "WARN") return "pause";
  return "reset_hwid";
}

function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s atrás`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m atrás`;
  return `${Math.floor(m / 60)}h atrás`;
}

const RED = ["#dc2626","#991b1b","#ef4444","#7f1d1d","#b91c1c"];
const ALERT_COLORS = { error: "#ef4444", warning: "#f59e0b", info: "#60a5fa" };

export default function DashboardOverview() {
  const { toggle: toggleSidebar } = useSidebar();
  const { admin } = useAuth();
  const { addToast } = useToast();
  const isOwner = admin?.role === "OWNER";

  const [data, setData] = useState<ExtendedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [newAuditCount, setNewAuditCount] = useState(0);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [keysGrowth, setKeysGrowth] = useState<KeyGrowthItem[]>([]);
  const [suspiciousIPs, setSuspiciousIPs] = useState<SuspiciousIP[]>([]);
  const [failedLogins, setFailedLogins] = useState(0);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [live, setLive] = useState(true);
  const [categoryMode, setCategoryMode] = useState<"bars" | "area">("bars");
  const [growthDays, setGrowthDays] = useState(30);
  const prevAuditCount = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [ov, al, tp, kg, si, fl] = await Promise.all([
      getOverview(), getAlerts(), getTopProducts(),
      getKeysGrowth(growthDays), getSuspiciousIPs(), getFailedLogins(),
    ]);
    if (ov.success && ov.data) {
      setData({ ...ov.data, bannedKeys: ov.data.bannedKeys ?? 0, pausedKeys: ov.data.pausedKeys ?? 0, expiredKeys: ov.data.expiredKeys ?? 0, pendingKeys: ov.data.pendingKeys ?? 0, expiringSoon: ov.data.expiringSoon ?? 0 });
      setLastUpdated(new Date());
    }
    if (al.success && al.data) setAlerts(al.data.items);
    if (tp.success && tp.data) setTopProducts(tp.data.items);
    if (kg.success && kg.data) setKeysGrowth(kg.data.items);
    if (si.success && si.data) setSuspiciousIPs(si.data.items.slice(0, 5));
    if (fl.success && fl.data) setFailedLogins(fl.data.count24h);
    if (!silent) setLoading(false);
  }, [growthDays]);

  const fetchAudit = useCallback(async (silent = false) => {
    if (!silent) setAuditLoading(true);
    const res = await getAuditLogs(1, 10);
    if (res.success && res.data) {
      const entries = res.data.items.map(i => ({
        id: i._id, action: mapEventToAction(i.event, i.level),
        target: i.keyMasked || i.discordIdMasked || undefined,
        details: i.message || undefined, timestamp: new Date(i.createdAt),
      }));
      if (silent && prevAuditCount.current > 0 && entries.length > 0) {
        const newOnes = entries.filter(e => !auditEntries.find(a => a.id === e.id)).length;
        if (newOnes > 0) setNewAuditCount(n => n + newOnes);
      }
      prevAuditCount.current = entries.length;
      setAuditEntries(entries);
    }
    if (!silent) setAuditLoading(false);
  }, [auditEntries]);

  const fetchSessions = useCallback(async () => {
    if (!isOwner) return;
    const res = await getActiveSessions();
    if (res.success && res.data) setActiveSessions(res.data.items);
  }, [isOwner]);

  useEffect(() => { void fetchAll(); void fetchAudit(); void fetchSessions(); }, []);

  // Live polling
  useEffect(() => {
    if (!live) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    setCountdown(15);
    intervalRef.current = setInterval(() => { void fetchAll(true); void fetchAudit(true); void fetchSessions(); setCountdown(15); }, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [live]);

  // Countdown timer
  useEffect(() => {
    if (!live) return;
    countdownRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [live]);

  // Re-fetch growth when days change
  useEffect(() => { getKeysGrowth(growthDays).then(r => { if (r.success && r.data) setKeysGrowth(r.data.items); }); }, [growthDays]);

  const chartData = [
    { name: "Ativas", value: data?.activeKeys ?? 0, fill: RED[0] },
    { name: "Pausadas", value: data?.pausedKeys ?? 0, fill: RED[1] },
    { name: "Banidas", value: data?.bannedKeys ?? 0, fill: RED[2] },
    { name: "Expiradas", value: data?.expiredKeys ?? 0, fill: RED[3] },
    { name: "Pendentes", value: data?.pendingKeys ?? 0, fill: RED[4] },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" description="Visao geral do sistema" onMenuClick={toggleSidebar} />
      <main className="p-4 lg:p-6 space-y-4">

        {/* ── Alerts strip ── */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
              {alerts.map((a, i) => (
                <motion.div key={a.code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm"
                  style={{ borderColor: `${ALERT_COLORS[a.type]}30`, background: `${ALERT_COLORS[a.type]}08` }}>
                  <span className="h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ background: ALERT_COLORS[a.type] }} />
                  <span style={{ color: ALERT_COLORS[a.type] }} className="font-medium">{a.message}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Live bar ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLive(v => !v)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${live ? "bg-green-500/15 text-green-400" : "bg-white/5 text-muted-foreground"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
              {live ? "Live · 15s" : "Pausado"}
            </button>
            {live && (
              <div className="flex items-center gap-2">
                <div className="h-1 w-20 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-green-400/60 transition-all duration-1000" style={{ width: `${(countdown / 15) * 100}%` }} />
                </div>
                <span className="text-[11px] text-muted-foreground/40 tabular-nums">{countdown}s</span>
              </div>
            )}
            {lastUpdated && <span className="text-[11px] text-muted-foreground/40 hidden sm:block">{lastUpdated.toLocaleTimeString("pt-BR")}</span>}
            {newAuditCount > 0 && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => { setNewAuditCount(0); void fetchAudit(); }}
                className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-xs text-green-400 font-medium">
                <BoltIcon className="h-3 w-3" />{newAuditCount} novo(s)
              </motion.button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { void fetchAll(); void fetchAudit(); }} disabled={loading}
            className="h-8 gap-1.5 text-xs border border-white/8 bg-white/[0.02] text-muted-foreground hover:text-foreground">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Atualizar
          </Button>
        </div>

        {/* ── Primary stats ── */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total de Licencas" value={loading ? "-" : data?.keys ?? 0} icon={Key} description="Todas as keys registradas" delay={0} />
          <StatsCard title="Usuarios Vinculados" value={loading ? "-" : data?.users ?? 0} icon={Users} description="Contas ativas" delay={100} />
          <StatsCard title="Produtos" value={loading ? "-" : data?.products ?? 0} icon={Package} description="Produtos cadastrados" delay={200} />
          <StatsCard title="Licencas Ativas" value={loading ? "-" : data?.activeKeys ?? 0} icon={CheckCircle} description="Keys operacionais" delay={300} trend={{ value: 12, isPositive: true }} />
        </div>

        {/* ── Secondary stats ── */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <StatsCard title="Keys Banidas" value={loading ? "-" : data?.bannedKeys ?? 0} icon={Ban} description="Bloqueadas" delay={400} />
          <StatsCard title="Keys Pausadas" value={loading ? "-" : data?.pausedKeys ?? 0} icon={Pause} description="Pausadas" delay={500} />
          <StatsCard title="Keys Expiradas" value={loading ? "-" : data?.expiredKeys ?? 0} icon={Clock} description="Vencidas" delay={550} />
          <StatsCard title="Pendentes" value={loading ? "-" : data?.pendingKeys ?? 0} icon={Activity} description="Aguardando vinculo" delay={575} />
          <StatsCard title="Expirando em 7 dias" value={loading ? "-" : data?.expiringSoon ?? 0} icon={Clock} description="Proximas do vencimento" delay={600} trend={{ value: 3, isPositive: false }} />
        </div>

        {/* ── Security row ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Failed logins */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <LockClosedIcon className="h-4 w-4 text-red-400" />
              <p className="text-sm font-bold">Seguranca</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-red-500/10 bg-red-500/5 p-3">
                <p className="text-2xl font-bold text-red-400 tabular-nums">{failedLogins}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Logins falhos (24h)</p>
              </div>
              <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3">
                <p className="text-2xl font-bold text-amber-400 tabular-nums">{suspiciousIPs.length}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">IPs suspeitos</p>
              </div>
            </div>
            {suspiciousIPs.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">Top IPs</p>
                {suspiciousIPs.slice(0, 3).map(ip => (
                  <div key={ip.ip} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-foreground/70">{ip.ip}</span>
                    <span className="text-red-400 font-bold">{ip.count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top products */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <ChartBarIcon className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold">Top Produtos</p>
            </div>
            <div className="space-y-2">
              {topProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 text-center py-4">Sem dados</p>
              ) : topProducts.map((p, i) => {
                const maxTotal = topProducts[0]?.total || 1;
                return (
                  <div key={p.productId}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground/80 truncate max-w-[120px]">{p.name}</span>
                      <span className="font-bold text-foreground tabular-nums">{p.total}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(p.total / maxTotal) * 100}%`, background: RED[i % RED.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active sessions */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserGroupIcon className="h-4 w-4 text-green-400" />
              <p className="text-sm font-bold">Admins Online</p>
              <span className="ml-auto text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full font-semibold">{activeSessions.length}</span>
            </div>
            {activeSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 text-center py-4">{isOwner ? "Nenhuma sessao ativa" : "Acesso restrito ao OWNER"}</p>
            ) : (
              <div className="space-y-2">
                {activeSessions.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-primary uppercase">{s.displayName[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{s.displayName}</p>
                      <p className="text-[10px] text-muted-foreground/50">{relativeTime(s.createdAt)}</p>
                    </div>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Audit + Quick Actions ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <ShieldAlert className="h-4 w-4 text-primary" />Audit Log
                </h3>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Atividades em tempo real</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => void fetchAudit()} disabled={auditLoading} className="h-7 px-2 text-xs bg-transparent border-white/8 gap-1">
                  <RefreshCw className={`h-3 w-3 ${auditLoading ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="outline" size="sm" asChild className="h-7 px-2 text-xs bg-transparent border-white/8">
                  <Link href="/dashboard/logs">Ver todos</Link>
                </Button>
              </div>
            </div>
            {auditLoading && auditEntries.length === 0 ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-white/[0.02] animate-pulse" />)}</div>
            ) : <AuditLog entries={auditEntries} maxEntries={8} />}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold mb-3">
                <Activity className="h-4 w-4 text-primary" />Acoes Rapidas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/dashboard/keys", label: "Gerenciar Keys", desc: "Buscar e editar" },
                  { href: "/dashboard/bulk-actions", label: "Acoes em Massa", desc: "Operacoes em lote" },
                  { href: "/dashboard/settings", label: "Configuracoes", desc: "Sistema" },
                  { href: "/dashboard/users", label: "Usuarios", desc: "Gerenciar" },
                ].map(({ href, label, desc }) => (
                  <Link key={href} href={href} className="group rounded-lg border border-white/5 bg-white/[0.01] p-3 hover:bg-white/[0.05] hover:border-primary/20 transition-all">
                    <p className="text-xs font-semibold group-hover:text-primary transition-colors">{label}</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />Status em Tempo Real
              </h3>
              <div className="space-y-3">
                {[
                  { label: "API Status", value: data ? "Operacional" : "—", pct: data ? 100 : 0 },
                  { label: "Keys Ativas", value: String(data?.activeKeys ?? 0), pct: data?.keys ? (data.activeKeys / data.keys) * 100 : 0 },
                  { label: "Keys Pendentes", value: String(data?.pendingKeys ?? 0), pct: data?.keys ? (data.pendingKeys / data.keys) * 100 : 0 },
                ].map(({ label, value, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground/60">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Keys growth chart ── */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <GlobeAltIcon className="h-4 w-4 text-primary" />Crescimento de Keys
              </h3>
              <p className="text-[11px] text-muted-foreground/60">Keys criadas por dia</p>
            </div>
            <div className="flex rounded-lg bg-white/5 p-0.5">
              {([7, 14, 30] as const).map(d => (
                <button key={d} onClick={() => setGrowthDays(d)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${growthDays === d ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <ChartContainer className="h-[180px] w-full" config={{ count: { color: "#dc2626" } }}>
            <ResponsiveContainer>
              <AreaChart data={keysGrowth} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickFormatter={v => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 10, fill: "#6b7280" }} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} fill="url(#redFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* ── Bottom charts ── */}
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-bold">Distribuicao</h3>
                <p className="text-[11px] text-muted-foreground/60">Status atual</p>
              </div>
              <span className="text-2xl font-bold tabular-nums">{loading ? "—" : data?.keys ?? 0}</span>
            </div>
            <ChartContainer className="mx-auto mt-2 aspect-square max-h-[160px]" config={{}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} stroke="transparent" isAnimationActive={!loading}>
                    {chartData.map((_, i) => <Cell key={i} fill={RED[i % RED.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {chartData.map(({ name, value, fill }) => (
                <div key={name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: fill }} />
                  {name} <span className="font-semibold text-foreground">{loading ? "—" : value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold">Status por Categoria</h3>
                <p className="text-[11px] text-muted-foreground/60">Comparativo</p>
              </div>
              <div className="flex rounded-lg bg-white/5 p-0.5">
                {(["bars", "area"] as const).map(m => (
                  <button key={m} onClick={() => setCategoryMode(m)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${categoryMode === m ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {m === "bars" ? "Barras" : "Area"}
                  </button>
                ))}
              </div>
            </div>
            <ChartContainer className="h-[200px] w-full" config={{ value: { color: "#dc2626" } }}>
              <ResponsiveContainer>
                {categoryMode === "bars" ? (
                  <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={RED[i % RED.length]} />)}
                    </Bar>
                  </BarChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="catFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: 12 }} />
                    <Area type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} fill="url(#catFill)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

      </main>
    </div>
  );
}
