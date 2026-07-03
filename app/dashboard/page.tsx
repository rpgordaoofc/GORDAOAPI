"use client";

import { useEffect, useState, useCallback } from "react";
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
  ArrowPathIcon as Loader2,
  ArrowPathIcon as RefreshCw,
} from "@heroicons/react/24/solid";
import { getOverview, getAuditLogs, type OverviewData, type AuditLogItem } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { AuditLog, type AuditLogEntry, type AuditAction } from "@/components/dashboard/audit-log";
import { AlertList, type AlertVariant } from "@/components/ui/alert-action";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChartContainer } from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

// Extended stats interface
interface ExtendedStats extends OverviewData {
  bannedKeys: number;
  pausedKeys: number;
  expiredKeys: number;
  pendingKeys: number;
  expiringSoon: number;
}

interface ActionAlert {
  id: string;
  variant: AlertVariant;
  title: string;
  description?: string;
}

// Map API events to AuditAction types based on event name and level
function mapEventToAction(event: string, level: string): AuditAction {
  const eventMap: Record<string, AuditAction> = {
    "key.reset_hwid": "reset_hwid",
    "key.unlink": "unlink",
    "key.add_days": "add_days",
    "key.remove_days": "remove_days",
    "key.pause": "pause",
    "key.unpause": "unpause",
    "key.ban": "ban",
    "key.unban": "unban",
    "maintenance.on": "maintenance_on",
    "maintenance.off": "maintenance_off",
    "bulk.pause": "bulk_pause",
    "bulk.reset": "bulk_reset",
    // Fallbacks for common patterns
    "admin.key.reset-hwid": "reset_hwid",
    "admin.key.unlink": "unlink",
    "admin.key.add-days": "add_days",
    "admin.key.pause": "pause",
    "admin.key.ban": "ban",
    "admin.maintenance": "maintenance_on",
  };
  
  // Try direct match
  if (eventMap[event]) return eventMap[event];
  
  // Try partial match based on event name
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
  
  // Use level to determine a sensible default
  if (level === "ERROR") return "ban"; // Show errors as red/ban style
  if (level === "WARN") return "pause"; // Show warnings as yellow/pause style
  
  return "reset_hwid"; // Default fallback for INFO
}

// Transform API audit log to component format
function transformAuditLog(item: AuditLogItem): AuditLogEntry {
  // Use the message directly as details since it contains the actual action description
  const details = item.message || undefined;
  
  // Use key or discord ID as target
  const target = item.keyMasked || item.discordIdMasked || undefined;
  
  return {
    id: item._id,
    action: mapEventToAction(item.event, item.level),
    target,
    details,
    timestamp: new Date(item.createdAt),
  };
}

export default function DashboardOverview() {
  const { toggle: toggleSidebar, sidebarOpen, setSidebarOpen } = useSidebar(); 
  const [data, setData] = useState<ExtendedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ActionAlert[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [categoryChartMode, setCategoryChartMode] = useState<"bars" | "area" | "radar">("bars");
  const { addToast } = useToast();

  const addAlert = useCallback((variant: AlertVariant, title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setAlerts((prev) => [...prev, { id, variant, title, description }]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    const response = await getAuditLogs(1, 10);
    if (response.success && response.data) {
      const transformed = response.data.items.map(transformAuditLog);
      setAuditEntries(transformed);
    }
    setAuditLoading(false);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const overviewRes = await getOverview();

      if (overviewRes.success && overviewRes.data) {
        setData({
          ...overviewRes.data,
          bannedKeys: overviewRes.data.bannedKeys ?? 0,
          pausedKeys: overviewRes.data.pausedKeys ?? 0,
          expiredKeys: overviewRes.data.expiredKeys ?? 0,
          pendingKeys: overviewRes.data.pendingKeys ?? 0,
          expiringSoon: overviewRes.data.expiringSoon ?? 0,
        });
      } else {
        addToast({
          title: "Erro ao carregar dados",
          description: overviewRes.message || "Tente novamente mais tarde",
          variant: "destructive",
        });
        setData({
          keys: 0,
          users: 0,
          products: 0,
          activeKeys: 0,
          bannedKeys: 0,
          pausedKeys: 0,
          expiredKeys: 0,
          pendingKeys: 0,
          expiringSoon: 0,
        });
      }
      setLoading(false);
    }
    fetchData();
    fetchAuditLogs();
  }, [addToast, fetchAuditLogs]);

  // Refresh audit logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAuditLogs();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchAuditLogs]);

  return (
    <div className="min-h-screen">
      <AlertList alerts={alerts} onDismiss={dismissAlert} />
      
      <Header
        title="Dashboard"
        description="Visao geral do sistema"
        onMenuClick={toggleSidebar}
      />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Primary Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total de Licencas" value={loading ? "-" : data?.keys ?? 0} icon={Key} description="Todas as keys registradas" delay={0} />
          <StatsCard title="Usuarios Vinculados" value={loading ? "-" : data?.users ?? 0} icon={Users} description="Contas ativas no sistema" delay={100} />
          <StatsCard title="Produtos" value={loading ? "-" : data?.products ?? 0} icon={Package} description="Produtos cadastrados" delay={200} />
          <StatsCard title="Licencas Ativas" value={loading ? "-" : data?.activeKeys ?? 0} icon={CheckCircle} description="Keys validas e operacionais" trend={{ value: 12, isPositive: true }} delay={300} />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <StatsCard title="Keys Banidas" value={loading ? "-" : data?.bannedKeys ?? 0} icon={Ban} description="Licencas bloqueadas" delay={400} />
          <StatsCard title="Keys Pausadas" value={loading ? "-" : data?.pausedKeys ?? 0} icon={Pause} description="Licencas temporariamente pausadas" delay={500} />
          <StatsCard title="Keys Expiradas" value={loading ? "-" : data?.expiredKeys ?? 0} icon={Clock} description="Licencas vencidas" delay={550} />
          <StatsCard title="Pendentes" value={loading ? "-" : data?.pendingKeys ?? 0} icon={Activity} description="Aguardando primeiro vinculo" delay={575} />
          <StatsCard title="Expirando em 7 dias" value={loading ? "-" : data?.expiringSoon ?? 0} icon={Clock} description="Licencas proximas do vencimento" trend={{ value: 3, isPositive: false }} delay={600} />
        </div>

        {/* Activity Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Audit Log */}
          <div className="rounded-xl border border-white/5 bg-white/3 p-5 animate-slide-up opacity-0 stagger-4" style={{ animationFillMode: "forwards" }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Audit Log
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  Atividades recentes em tempo real • {auditEntries.length} evento(s)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchAuditLogs} disabled={auditLoading} className="bg-transparent gap-1.5 h-8 text-xs border-border/50">
                  <RefreshCw className={`h-3.5 w-3.5 ${auditLoading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
                <Button variant="outline" size="sm" asChild className="bg-transparent h-8 text-xs border-border/50">
                  <Link href="/dashboard/logs">Ver Todos</Link>
                </Button>
              </div>
            </div>
            <div className="mt-5">
              {auditLoading && auditEntries.length === 0 ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg border border-border/40 bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ) : (
                <AuditLog entries={auditEntries} maxEntries={7} />
              )}
            </div>
          </div>

          {/* Quick Actions + System Status */}
          <div className="space-y-5">
            <div className="rounded-xl border border-white/5 bg-white/3 p-5 animate-slide-up opacity-0 stagger-4" style={{ animationFillMode: "forwards" }}>
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <Activity className="h-4 w-4 text-primary" />
                Acoes Rapidas
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground/70">Acesse as funcionalidades mais utilizadas</p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <QuickActionCard href="/dashboard/keys" title="Gerenciar Keys" description="Buscar, editar e gerenciar licencas" />
                <QuickActionCard href="/dashboard/bulk-actions" title="Acoes em Massa" description="Executar operacoes em lote" />
                <QuickActionCard href="/dashboard/settings" title="Configuracoes" description="Ajustar sistema e manutencao" />
                <QuickActionCard href="/dashboard/users" title="Usuarios" description="Gerenciar usuarios vinculados" />
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/3 p-5 animate-slide-up opacity-0 stagger-5" style={{ animationFillMode: "forwards" }}>
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <TrendingUp className="h-4 w-4 text-primary" />
                Status em Tempo Real
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground/70">Indicadores baseados na API admin</p>
              <div className="mt-4 space-y-3.5">
                <StatusItem label="API Status" status={data ? "Operacional" : "Indisponível"} percentage={data ? 100 : 0} />
                <StatusItem label="Keys Ativas" status={String(data?.activeKeys ?? 0)} percentage={data?.keys ? ((data.activeKeys / data.keys) * 100) : 0} />
                <StatusItem label="Keys Pendentes" status={String(data?.pendingKeys ?? 0)} percentage={data?.keys ? ((data.pendingKeys / data.keys) * 100) : 0} />
                <StatusItem label="Expirando em 7 dias" status={String(data?.expiringSoon ?? 0)} percentage={data?.keys ? ((data.expiringSoon / data.keys) * 100) : 0} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-5 animate-slide-up opacity-0" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
          <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/3 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Distribuicao de Licencas</h3>
                <p className="mt-0.5 text-xs text-muted-foreground/70">Status atual das keys</p>
              </div>
              <span className="text-2xl font-bold tabular-nums">{loading ? "-" : data?.keys ?? 0}</span>
            </div>
            <ChartContainer className="mx-auto mt-4 aspect-square max-h-[200px]" config={{
              active: { label: "Ativas", color: "oklch(0.72 0.19 142)" },
              paused: { label: "Pausadas", color: "oklch(0.75 0.18 55)" },
              banned: { label: "Banidas", color: "oklch(0.63 0.24 25)" },
              expired: { label: "Expiradas", color: "oklch(0.55 0 0)" },
              pending: { label: "Pendentes", color: "oklch(0.62 0.18 250)" },
            }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={[
                    { name: "Ativas", value: data?.activeKeys ?? 0 },
                    { name: "Pausadas", value: data?.pausedKeys ?? 0 },
                    { name: "Banidas", value: data?.bannedKeys ?? 0 },
                    { name: "Expiradas", value: data?.expiredKeys ?? 0 },
                    { name: "Pendentes", value: data?.pendingKeys ?? 0 },
                  ]} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} stroke="var(--background)" strokeWidth={2} isAnimationActive={!loading}>
                    {["oklch(0.72 0.19 142)", "oklch(0.75 0.18 55)", "oklch(0.63 0.24 25)", "oklch(0.55 0 0)", "oklch(0.62 0.18 250)"].map((fill, i) => (
                      <Cell key={i} fill={fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
              {[
                { color: "oklch(0.72 0.19 142)", label: "Ativas", value: data?.activeKeys },
                { color: "oklch(0.75 0.18 55)", label: "Pausadas", value: data?.pausedKeys },
                { color: "oklch(0.63 0.24 25)", label: "Banidas", value: data?.bannedKeys },
                { color: "oklch(0.55 0 0)", label: "Expiradas", value: data?.expiredKeys },
                { color: "oklch(0.62 0.18 250)", label: "Pendentes", value: data?.pendingKeys },
              ].map(({ color, label, value }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                  {label} <span className="font-semibold text-foreground">{loading ? "-" : value ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 rounded-xl border border-white/5 bg-white/3 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Status por Categoria</h3>
                <p className="mt-0.5 text-xs text-muted-foreground/70">Comparativo entre os status</p>
              </div>
              <div className="flex gap-0.5 rounded-lg bg-muted/40 p-0.5">
                {(["bars", "area", "radar"] as const).map((mode) => (
                  <button key={mode} className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${categoryChartMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setCategoryChartMode(mode)} type="button">
                    {mode === "bars" ? "Barras" : mode === "area" ? "Area" : "Radar"}
                  </button>
                ))}
              </div>
            </div>
            <ChartContainer className="mt-4 h-[240px] w-full" config={{ value: { label: "Keys", color: "oklch(0.55 0.22 25)" } }}>
              <ResponsiveContainer>
                {categoryChartMode === "bars" ? (
                  <BarChart data={[
                    { name: "Ativas", value: data?.activeKeys ?? 0 },
                    { name: "Pausadas", value: data?.pausedKeys ?? 0 },
                    { name: "Banidas", value: data?.bannedKeys ?? 0 },
                    { name: "Expiradas", value: data?.expiredKeys ?? 0 },
                    { name: "Pendentes", value: data?.pendingKeys ?? 0 },
                  ]} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.22 0.01 20 / 0.5)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                      {["oklch(0.72 0.19 142)", "oklch(0.75 0.18 55)", "oklch(0.63 0.24 25)", "oklch(0.55 0 0)", "oklch(0.62 0.18 250)"].map((fill, i) => (
                        <Cell key={i} fill={fill} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : categoryChartMode === "area" ? (
                  <AreaChart data={[
                    { name: "Ativas", value: data?.activeKeys ?? 0 },
                    { name: "Pausadas", value: data?.pausedKeys ?? 0 },
                    { name: "Banidas", value: data?.bannedKeys ?? 0 },
                    { name: "Expiradas", value: data?.expiredKeys ?? 0 },
                    { name: "Pendentes", value: data?.pendingKeys ?? 0 },
                  ]} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.22 0.01 20 / 0.5)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.18} />
                  </AreaChart>
                ) : (
                  <RadarChart data={[
                    { name: "Ativas", value: data?.activeKeys ?? 0 },
                    { name: "Pausadas", value: data?.pausedKeys ?? 0 },
                    { name: "Banidas", value: data?.bannedKeys ?? 0 },
                    { name: "Expiradas", value: data?.expiredKeys ?? 0 },
                    { name: "Pendentes", value: data?.pendingKeys ?? 0 },
                  ]}>
                    <PolarGrid stroke="oklch(0.22 0.01 20 / 0.5)" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <Radar dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.18} />
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

function QuickActionCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="relative font-semibold text-sm text-foreground">
        {title}
      </p>
      <p className="relative mt-1 text-xs text-muted-foreground/70">{description}</p>
    </Link>
  );
}

function StatusItem({
  label,
  status,
  percentage,
}: {
  label: string;
  status: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="font-semibold text-foreground text-xs">{status}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted/60">
        <div
          className="h-full rounded-full bg-primary/70 transition-all duration-700"
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}

function StatusCard({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{count}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{percentage}% do total</p>
    </div>
  );
}
