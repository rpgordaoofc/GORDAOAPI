"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { useSidebar } from "./layout";
import { StatsCard } from "@/components/ui/stats-card";
import {
  KeyIcon as Key,
  UsersIcon as Users,
  CubeIcon as Package,
  CheckCircleIcon as CheckCircle,
  SignalIcon as Activity,
  ArrowTrendingUpIcon as TrendingUp,
  NoSymbolIcon as Ban,
  PauseIcon as Pause,
  ClockIcon as Clock,
  ShieldExclamationIcon as ShieldAlert,
  ArrowPathIcon as RefreshCw,
} from "@heroicons/react/24/solid";
import { getOverview, getAuditLogs, type OverviewData, type AuditLogItem } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { AuditLog, type AuditLogEntry, type AuditAction } from "@/components/dashboard/audit-log";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChartContainer } from "@/components/ui/chart";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface ExtendedStats extends OverviewData {
  bannedKeys: number;
  pausedKeys: number;
  expiredKeys: number;
  pendingKeys: number;
  expiringSoon: number;
}

function mapEventToAction(event: string, level: string): AuditAction {
  const lowerEvent = event.toLowerCase();
  if (lowerEvent.includes("hwid") && lowerEvent.includes("reset")) return "reset_hwid";
  if (lowerEvent.includes("unlink")) return "unlink";
  if (lowerEvent.includes("add") && lowerEvent.includes("day")) return "add_days";
  if (lowerEvent.includes("remove") && lowerEvent.includes("day")) return "remove_days";
  if (lowerEvent.includes("unpause")) return "unpause";
  if (lowerEvent.includes("pause")) return "pause";
  if (lowerEvent.includes("unban")) return "unban";
  if (lowerEvent.includes("ban")) return "ban";
  if (lowerEvent.includes("maintenance")) return level === "INFO" ? "maintenance_off" : "maintenance_on";
  if (lowerEvent.includes("bulk") && lowerEvent.includes("reset")) return "bulk_reset";
  if (lowerEvent.includes("bulk") && lowerEvent.includes("pause")) return "bulk_pause";
  if (level === "ERROR") return "ban";
  if (level === "WARN") return "pause";
  return "reset_hwid";
}

function transformAuditLog(item: AuditLogItem): AuditLogEntry {
  return {
    id: item._id,
    action: mapEventToAction(item.event, item.level),
    target: item.keyMasked || item.discordIdMasked || undefined,
    details: item.message || undefined,
    timestamp: new Date(item.createdAt),
  };
}

// Red palette for charts
const RED_SHADES = [
  "#dc2626", // red-600
  "#991b1b", // red-800
  "#ef4444", // red-500
  "#7f1d1d", // red-900
  "#b91c1c", // red-700
];

const CHART_DATA = (data: ExtendedStats | null) => [
  { name: "Ativas",   value: data?.activeKeys  ?? 0, fill: RED_SHADES[0] },
  { name: "Pausadas", value: data?.pausedKeys  ?? 0, fill: RED_SHADES[1] },
  { name: "Banidas",  value: data?.bannedKeys  ?? 0, fill: RED_SHADES[2] },
  { name: "Expiradas",value: data?.expiredKeys ?? 0, fill: RED_SHADES[3] },
  { name: "Pendentes",value: data?.pendingKeys ?? 0, fill: RED_SHADES[4] },
];

export default function DashboardOverview() {
  const { toggle: toggleSidebar } = useSidebar();
  const [data, setData] = useState<ExtendedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [categoryMode, setCategoryMode] = useState<"bars" | "area" | "radar">("bars");
  const [live, setLive] = useState(true);
  const { addToast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await getOverview();
    if (res.success && res.data) {
      setData({
        ...res.data,
        bannedKeys:  res.data.bannedKeys  ?? 0,
        pausedKeys:  res.data.pausedKeys  ?? 0,
        expiredKeys: res.data.expiredKeys ?? 0,
        pendingKeys: res.data.pendingKeys ?? 0,
        expiringSoon: res.data.expiringSoon ?? 0,
      });
      setLastUpdated(new Date());
    } else if (!silent) {
      addToast({ title: "Erro ao carregar dados", description: res.message, variant: "destructive" });
    }
    if (!silent) setLoading(false);
  }, [addToast]);

  const fetchAudit = useCallback(async (silent = false) => {
    if (!silent) setAuditLoading(true);
    const res = await getAuditLogs(1, 10);
    if (res.success && res.data) {
      setAuditEntries(res.data.items.map(transformAuditLog));
    }
    if (!silent) setAuditLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    void fetchStats();
    void fetchAudit();
  }, [fetchStats, fetchAudit]);

  // Live polling every 15s
  useEffect(() => {
    if (!live) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      void fetchStats(true);
      void fetchAudit(true);
    }, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [live, fetchStats, fetchAudit]);

  const handleRefresh = () => {
    void fetchStats();
    void fetchAudit();
  };

  const chartData = CHART_DATA(data);

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" description="Visao geral do sistema" onMenuClick={toggleSidebar} />

      <main className="p-4 lg:p-6 space-y-5">

        {/* Live indicator + refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLive((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${live ? "bg-green-500/15 text-green-400" : "bg-white/5 text-muted-foreground"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
              {live ? "Tempo Real (15s)" : "Pausado"}
            </button>
            {lastUpdated && (
              <span className="text-[11px] text-muted-foreground">
                Atualizado {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Primary Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total de Licencas"   value={loading ? "-" : data?.keys       ?? 0} icon={Key}          description="Todas as keys registradas"         delay={0}   />
          <StatsCard title="Usuarios Vinculados" value={loading ? "-" : data?.users      ?? 0} icon={Users}        description="Contas ativas no sistema"          delay={100} />
          <StatsCard title="Produtos"            value={loading ? "-" : data?.products   ?? 0} icon={Package}      description="Produtos cadastrados"              delay={200} />
          <StatsCard title="Licencas Ativas"     value={loading ? "-" : data?.activeKeys ?? 0} icon={CheckCircle}  description="Keys validas e operacionais"       delay={300} trend={{ value: 12, isPositive: true }} />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <StatsCard title="Keys Banidas"       value={loading ? "-" : data?.bannedKeys  ?? 0} icon={Ban}   description="Licencas bloqueadas"              delay={400} />
          <StatsCard title="Keys Pausadas"      value={loading ? "-" : data?.pausedKeys  ?? 0} icon={Pause} description="Temporariamente pausadas"         delay={500} />
          <StatsCard title="Keys Expiradas"     value={loading ? "-" : data?.expiredKeys ?? 0} icon={Clock} description="Licencas vencidas"               delay={550} />
          <StatsCard title="Pendentes"          value={loading ? "-" : data?.pendingKeys ?? 0} icon={Activity} description="Aguardando primeiro vinculo" delay={575} />
          <StatsCard title="Expirando em 7 dias" value={loading ? "-" : data?.expiringSoon ?? 0} icon={Clock} description="Proximas do vencimento" delay={600} trend={{ value: 3, isPositive: false }} />
        </div>

        {/* Middle row: Audit + Quick Actions + Status */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* Audit Log */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Audit Log
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Atividades em tempo real • {auditEntries.length} evento(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => void fetchAudit()} disabled={auditLoading} className="h-7 px-2 text-xs bg-transparent border-white/10 gap-1">
                  <RefreshCw className={`h-3 w-3 ${auditLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" asChild className="h-7 px-2 text-xs bg-transparent border-white/10">
                  <Link href="/dashboard/logs">Ver todos</Link>
                </Button>
              </div>
            </div>
            {auditLoading && auditEntries.length === 0 ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-11 rounded-lg bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : (
              <AuditLog entries={auditEntries} maxEntries={8} />
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Quick Actions */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold mb-3">
                <Activity className="h-4 w-4 text-primary" />
                Acoes Rapidas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/dashboard/keys",         label: "Gerenciar Keys",   desc: "Buscar e editar licencas" },
                  { href: "/dashboard/bulk-actions",  label: "Acoes em Massa",   desc: "Operacoes em lote" },
                  { href: "/dashboard/settings",      label: "Configuracoes",    desc: "Sistema e manutencao" },
                  { href: "/dashboard/users",         label: "Usuarios",         desc: "Gerenciar vinculados" },
                ].map(({ href, label, desc }) => (
                  <Link key={href} href={href} className="group rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:bg-white/[0.05] hover:border-primary/20 transition-all">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Real-time status bars */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                Status em Tempo Real
              </h3>
              <div className="space-y-3">
                {[
                  { label: "API Status",       value: data ? "Operacional" : "Indisponível",  pct: data ? 100 : 0 },
                  { label: "Keys Ativas",      value: String(data?.activeKeys  ?? 0), pct: data?.keys ? (data.activeKeys  / data.keys) * 100 : 0 },
                  { label: "Keys Pendentes",   value: String(data?.pendingKeys ?? 0), pct: data?.keys ? (data.pendingKeys / data.keys) * 100 : 0 },
                  { label: "Expirando 7 dias", value: String(data?.expiringSoon ?? 0), pct: data?.keys ? (data.expiringSoon / data.keys) * 100 : 0 },
                ].map(({ label, value, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{label}</span>
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

        {/* Charts row */}
        <div className="grid gap-5 lg:grid-cols-5">

          {/* Pie chart */}
          <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-bold">Distribuicao de Licencas</h3>
                <p className="text-[11px] text-muted-foreground">Status atual das keys</p>
              </div>
              <span className="text-2xl font-bold tabular-nums">{loading ? "—" : data?.keys ?? 0}</span>
            </div>

            <ChartContainer className="mx-auto mt-2 aspect-square max-h-[180px]" config={{}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} stroke="transparent" isAnimationActive={!loading}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
              {chartData.map(({ name, value, fill }) => (
                <div key={name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: fill }} />
                  {name} <span className="font-semibold text-foreground">{loading ? "—" : value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar/Area/Radar */}
          <div className="lg:col-span-3 rounded-xl border border-white/5 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold">Status por Categoria</h3>
                <p className="text-[11px] text-muted-foreground">Comparativo entre os status</p>
              </div>
              <div className="flex rounded-lg bg-white/5 p-0.5">
                {(["bars", "area", "radar"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setCategoryMode(m)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors capitalize ${categoryMode === m ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {m === "bars" ? "Barras" : m === "area" ? "Area" : "Radar"}
                  </button>
                ))}
              </div>
            </div>

            <ChartContainer className="h-[220px] w-full" config={{ value: { color: "#dc2626" } }}>
              <ResponsiveContainer>
                {categoryMode === "bars" ? (
                  <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip
                      contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: 12 }}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                ) : categoryMode === "area" ? (
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: 12 }} />
                    <Area type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} fill="url(#redGrad)" />
                  </AreaChart>
                ) : (
                  <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Radar dataKey="value" stroke="#dc2626" strokeWidth={2} fill="#dc2626" fillOpacity={0.15} />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

      </main>
    </div>
  );
}
