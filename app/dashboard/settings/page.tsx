"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast-provider";
import { useSidebar } from "../layout";
import {
  PowerIcon, ShieldCheckIcon, LockClosedIcon, GlobeAltIcon,
  CircleStackIcon, ClipboardDocumentIcon, ArrowPathIcon,
  BookmarkSquareIcon, LinkIcon, CheckCircleIcon, ExclamationTriangleIcon,
  ChevronDownIcon, BoltIcon, ArrowDownTrayIcon, SignalIcon,
  CpuChipIcon, ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/solid";
import {
  setMaintenance, getSettings, getPrivacySettings, setPrivacySettings,
  getSecuritySettings, setSecuritySettings, getWebhookSettings, setWebhookSettings,
  testWebhook, pingHealth, getExportLogsUrl,
  type SettingsData, type PrivacySettings, type SecuritySettings, type WebhookSettings,
} from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, accent, badge, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  accent?: string; badge?: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-5 py-4 bg-white/[0.02] hover:bg-white/[0.035] transition-colors text-left">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ background: accent ? `${accent}18` : "rgba(255,255,255,0.05)" }}>
          <Icon className="h-4 w-4" style={{ color: accent ?? "#9ca3af" }} />
        </span>
        <span className="flex-1 text-sm font-semibold">{title}</span>
        {badge}
        <ChevronDownIcon className={`h-4 w-4 text-muted-foreground/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-4 border-t border-white/5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, desc, checked, onChange, loading, accent = "#9ca3af" }: {
  icon: React.ElementType; title: string; desc: string; checked: boolean; onChange: () => void; loading?: boolean; accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.035] transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 shrink-0" style={{ color: checked ? accent : "#6b7280" }} />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground/60">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={loading} />
    </div>
  );
}

function InfoRow({ label, value, onCopy, mono }: { label: string; value: string; onCopy?: () => void; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs text-foreground/80 ${mono ? "font-mono" : ""}`}>{value}</span>
        {onCopy && <button onClick={onCopy} className="text-muted-foreground/30 hover:text-primary transition-colors"><ClipboardDocumentIcon className="h-3.5 w-3.5" /></button>}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <p className="text-xl font-bold tabular-nums" style={{ color: color ?? "#fff" }}>{value}</p>
      <p className="text-[11px] text-muted-foreground/50 mt-0.5">{label}</p>
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#dc2626" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 120; const h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}18`} stroke="none" />
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { toggle: toggleSidebar } = useSidebar();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [webhook, setWebhook] = useState<WebhookSettings | null>(null);

  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("Sistema em manutencao, voltamos em breve.");
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ ok: boolean; latency?: number } | null>(null);

  // Webhook form
  const [wUrl, setWUrl] = useState("");
  const [wUser, setWUser] = useState("");
  const [wAvatar, setWAvatar] = useState("");
  const [wLevel, setWLevel] = useState<"INFO" | "WARN" | "ERROR">("INFO");
  const [wSensitive, setWSensitive] = useState(false);

  // Health ping
  const [pingHistory, setPingHistory] = useState<number[]>([]);
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [pingStatus, setPingStatus] = useState<"ok" | "slow" | "error" | null>(null);
  const pingRef = useRef<NodeJS.Timeout | null>(null);

  // System message
  const [sysMessage, setSysMessage] = useState("");
  const [sysMessageSaved, setSysMessageSaved] = useState(false);

  // Export
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [exportLevel, setExportLevel] = useState("");
  const [exportLimit, setExportLimit] = useState("500");

  const toast = (title: string, desc: string, variant: "success" | "warning" | "destructive" = "success") =>
    addToast({ title, description: desc, variant });

  const load = useCallback(async () => {
    setLoading(true);
    const [s, p, sec, w] = await Promise.all([getSettings(), getPrivacySettings(), getSecuritySettings(), getWebhookSettings()]);
    if (s.success && s.data) setSettings(s.data);
    if (p.success && p.data) setPrivacy(p.data);
    if (sec.success && sec.data) setSecurity(sec.data);
    if (w.success && w.data) {
      setWebhook(w.data);
      setWUrl(w.data.url ?? ""); setWUser(w.data.username ?? "");
      setWAvatar(w.data.avatarUrl ?? ""); setWLevel(w.data.minLevel); setWSensitive(w.data.allowSensitive);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Health ping every 30s
  const doPing = useCallback(async () => {
    const start = Date.now();
    try {
      const res = await pingHealth();
      const ms = res.success && res.data ? res.data.latencyMs : Date.now() - start;
      setLastPing(ms);
      setPingHistory(h => [...h.slice(-19), ms]);
      setPingStatus(ms < 200 ? "ok" : ms < 800 ? "slow" : "error");
    } catch {
      setPingStatus("error");
      setPingHistory(h => [...h.slice(-19), 999]);
    }
  }, []);

  useEffect(() => {
    void doPing();
    pingRef.current = setInterval(doPing, 30000);
    return () => { if (pingRef.current) clearInterval(pingRef.current); };
  }, [doPing]);

  const toggleMaintenance = async () => {
    setMaintenanceLoading(true);
    const res = await setMaintenance(!maintenanceOn, maintenanceMsg);
    setMaintenanceLoading(false);
    if (res.success && res.data) { setMaintenanceOn(res.data.enabled); toast(res.data.enabled ? "Manutencao ativada" : "Manutencao desativada", res.data.enabled ? "API retornando 503" : "API normal", res.data.enabled ? "warning" : "success"); }
    else toast("Erro", res.message, "destructive");
  };

  const togglePrivacy = async () => {
    if (!privacy) return;
    setPrivacyLoading(true);
    const v = !privacy.censorEnabled;
    const res = await setPrivacySettings(v);
    setPrivacyLoading(false);
    if (res.success && res.data) { setPrivacy(res.data); toast(v ? "Censura ativada" : "Censura desativada", v ? "Dados sensiveis ocultados" : "Dados visiveis"); }
    else toast("Erro", res.message, "destructive");
  };

  const toggleSecurity = async () => {
    if (!security) return;
    setSecurityLoading(true);
    const v = !security.hwidLockGlobal;
    const res = await setSecuritySettings(v);
    setSecurityLoading(false);
    if (res.success && res.data) { setSecurity(res.data); toast(v ? "HWID Lock ativado" : "HWID Lock desativado", v ? "Keys vinculadas ao hardware" : "HWID lock global off"); }
    else toast("Erro", res.message, "destructive");
  };

  const saveWebhook = async () => {
    setWebhookLoading(true);
    const res = await setWebhookSettings({ enabled: webhook?.enabled ?? false, url: wUrl || null, username: wUser || null, avatarUrl: wAvatar || null, minLevel: wLevel, allowSensitive: wSensitive });
    setWebhookLoading(false);
    if (res.success && res.data) { setWebhook(res.data); toast("Webhook salvo", "Configuracoes atualizadas"); }
    else toast("Erro", res.message, "destructive");
  };

  const toggleWebhook = async () => {
    if (!webhook) return;
    setWebhookLoading(true);
    const v = !webhook.enabled;
    const res = await setWebhookSettings({ enabled: v });
    setWebhookLoading(false);
    if (res.success && res.data) { setWebhook(res.data); toast(v ? "Webhook ativado" : "Webhook desativado", v ? "Notificacoes Discord on" : "off"); }
    else toast("Erro", res.message, "destructive");
  };

  const handleTestWebhook = async () => {
    setWebhookTesting(true);
    setWebhookTestResult(null);
    const res = await testWebhook();
    setWebhookTesting(false);
    if (res.success && res.data) {
      setWebhookTestResult({ ok: true, latency: res.data.latencyMs });
      toast("✅ Webhook funcionando!", `Mensagem enviada em ${res.data.latencyMs}ms`);
    } else {
      setWebhookTestResult({ ok: false });
      toast("❌ Falha no webhook", res.message, "destructive");
    }
    setTimeout(() => setWebhookTestResult(null), 5000);
  };

  const handleExport = () => {
    const url = getExportLogsUrl(exportFormat, exportLevel || undefined, Number(exportLimit) || 500);
    window.open(url, "_blank");
  };

  const copy = (v: string, l: string) => { navigator.clipboard.writeText(v); toast("Copiado!", `${l} copiado`); };

  const pingColor = pingStatus === "ok" ? "#34d399" : pingStatus === "slow" ? "#fbbf24" : pingStatus === "error" ? "#f87171" : "#6b7280";

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Configuracoes" description="Gerencie o sistema" onMenuClick={toggleSidebar} isMaintenanceMode={maintenanceOn} />
        <main className="p-4 lg:p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }} className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Configuracoes" description="Sistema, seguranca, webhooks e saude da API" onMenuClick={toggleSidebar} isMaintenanceMode={maintenanceOn} />

      <main className="p-4 lg:p-6 space-y-3">

        {/* ── 1. Health Monitor ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
          <Section title="Saude da API" icon={SignalIcon} accent={pingColor}
            badge={<span className="flex items-center gap-1.5 text-xs mr-1" style={{ color: pingColor }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: pingColor }} />
              {lastPing !== null ? `${lastPing}ms` : "—"}
            </span>}>
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">Latencia atual</p>
                <p className="text-3xl font-bold tabular-nums" style={{ color: pingColor }}>
                  {lastPing !== null ? `${lastPing}ms` : "—"}
                </p>
                <p className="text-xs font-medium" style={{ color: pingColor }}>
                  {pingStatus === "ok" ? "Excelente" : pingStatus === "slow" ? "Lento" : pingStatus === "error" ? "Erro" : "Aguardando..."}
                </p>
              </div>
              <div className="flex-1 flex flex-col items-end gap-1">
                <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">Historico (ultimos 20 pings)</p>
                <Sparkline data={pingHistory} color={pingColor} />
              </div>
              <Button variant="ghost" size="sm" onClick={doPing} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground border border-white/8">
                <ArrowPathIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <p className="text-muted-foreground/50 mb-1">Node.js</p>
                <p className="font-mono font-semibold">{settings?.system?.node ?? "—"}</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <p className="text-muted-foreground/50 mb-1">Uptime</p>
                <p className="font-mono font-semibold">{settings?.system?.apiUptimeSec ? `${Math.floor(settings.system.apiUptimeSec / 3600)}h ${Math.floor((settings.system.apiUptimeSec % 3600) / 60)}m` : "—"}</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <p className="text-muted-foreground/50 mb-1">Versao API</p>
                <p className="font-mono font-semibold">{settings?.apiVersion ?? "—"}</p>
              </div>
            </div>
          </Section>
        </motion.div>

        {/* ── 2. Maintenance ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.05 }}>
          <Section title="Modo de Manutencao" icon={PowerIcon} accent={maintenanceOn ? "#f59e0b" : "#22c55e"}>
            <div className="space-y-3">
              <div className={`flex items-center gap-4 rounded-xl p-4 border transition-all duration-300 ${maintenanceOn ? "border-amber-500/20 bg-amber-500/5" : "border-green-500/20 bg-green-500/5"}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${maintenanceOn ? "bg-amber-500/15" : "bg-green-500/15"}`}>
                  {maintenanceOn ? <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" /> : <CheckCircleIcon className="h-5 w-5 text-green-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{maintenanceOn ? "Sistema em Manutencao" : "Sistema Operacional"}</p>
                  <p className="text-xs text-muted-foreground/60">{maintenanceOn ? "API retornando 503 para todos os requests" : "API funcionando normalmente"}</p>
                </div>
                <Switch checked={maintenanceOn} onCheckedChange={toggleMaintenance} disabled={maintenanceLoading} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/50 uppercase tracking-widest block mb-2">Mensagem de Manutencao</label>
                <Input value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} placeholder="Voltamos em breve..." className="bg-white/[0.03] border-white/8 h-9 text-sm" />
              </div>
            </div>
          </Section>
        </motion.div>

        {/* ── 3. Security + API Info ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.1 }} className="grid gap-3 lg:grid-cols-2">
          <Section title="Seguranca" icon={ShieldCheckIcon} accent="#dc2626">
            <div className="space-y-2">
              <ToggleRow icon={LockClosedIcon} title="HWID Lock Global" desc="Vincular todas as keys ao hardware" checked={security?.hwidLockGlobal ?? false} onChange={toggleSecurity} loading={securityLoading} accent="#dc2626" />
              <ToggleRow icon={ShieldCheckIcon} title="Modo Censura" desc="Ocultar dados sensiveis nas respostas" checked={privacy?.censorEnabled ?? false} onChange={togglePrivacy} loading={privacyLoading} accent="#dc2626" />
            </div>
          </Section>
          <Section title="Informacoes da API" icon={GlobeAltIcon} accent="#60a5fa">
            <InfoRow label="Base URL" value={settings?.apiBaseUrl ?? "—"} onCopy={() => copy(settings?.apiBaseUrl ?? "", "Base URL")} mono />
            <InfoRow label="Rate Limit" value={`${settings?.rateLimit ?? 100} req/min`} />
            <InfoRow label="Timeout" value={`${settings?.timeout ?? 30}s`} />
            <InfoRow label="Key Prefix" value={settings?.keyPrefix ?? "—"} onCopy={() => copy(settings?.keyPrefix ?? "", "Key Prefix")} mono />
          </Section>
        </motion.div>

        {/* ── 4. Webhook ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.15 }}>
          <Section title="Webhook Discord" icon={LinkIcon} accent="#818cf8"
            badge={<span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mr-1 ${webhook?.enabled ? "text-green-400 bg-green-500/10" : "text-gray-500 bg-white/5"}`}>{webhook?.enabled ? "Ativo" : "Inativo"}</span>}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground/50">Notificacoes em tempo real no Discord</p>
                <Switch checked={webhook?.enabled ?? false} onCheckedChange={toggleWebhook} disabled={webhookLoading} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-muted-foreground/50 uppercase tracking-widest block mb-1.5">Webhook URL</label>
                  <Input value={wUrl} onChange={e => setWUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/..." className="bg-white/[0.03] border-white/8 h-9 text-sm font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground/50 uppercase tracking-widest block mb-1.5">Username do Bot</label>
                  <Input value={wUser} onChange={e => setWUser(e.target.value)} placeholder="RP GORDAO" className="bg-white/[0.03] border-white/8 h-9 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground/50 uppercase tracking-widest block mb-1.5">Avatar URL</label>
                  <Input value={wAvatar} onChange={e => setWAvatar(e.target.value)} placeholder="https://..." className="bg-white/[0.03] border-white/8 h-9 text-sm font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground/50 uppercase tracking-widest block mb-1.5">Nivel Minimo</label>
                  <select value={wLevel} onChange={e => setWLevel(e.target.value as "INFO" | "WARN" | "ERROR")} className="w-full h-9 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-sm text-foreground appearance-none">
                    <option value="INFO">INFO — Todas</option>
                    <option value="WARN">WARN — Avisos e erros</option>
                    <option value="ERROR">ERROR — Criticos</option>
                  </select>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Dados Sensiveis</p>
                    <p className="text-[11px] text-muted-foreground/50">Incluir keys/HWID</p>
                  </div>
                  <Switch checked={wSensitive} onCheckedChange={setWSensitive} />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={saveWebhook} disabled={webhookLoading} className="bg-primary hover:bg-primary/90 h-9 gap-2">
                  {webhookLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <BookmarkSquareIcon className="h-4 w-4" />}
                  Salvar
                </Button>
                <Button onClick={handleTestWebhook} disabled={webhookTesting || !wUrl} variant="outline" className="h-9 gap-2 border-white/10 bg-transparent hover:bg-white/5">
                  {webhookTesting ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <BoltIcon className="h-4 w-4" />}
                  Testar Webhook
                </Button>
                <AnimatePresence>
                  {webhookTestResult && (
                    <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className={`flex items-center gap-1.5 rounded-lg px-3 text-xs font-semibold h-9 ${webhookTestResult.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {webhookTestResult.ok ? `✅ ${webhookTestResult.latency}ms` : "❌ Falhou"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Section>
        </motion.div>

        {/* ── 5. System Message ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.2 }}>
          <Section title="Mensagem do Sistema" icon={ChatBubbleLeftEllipsisIcon} accent="#f472b6" defaultOpen={false}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground/60">Aviso interno exibido para todos os admins logados no dashboard.</p>
              <textarea
                value={sysMessage}
                onChange={e => setSysMessage(e.target.value)}
                placeholder="Ex: Deploy agendado para hoje às 23h. Mantenham-se atentos."
                rows={3}
                className="w-full rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <div className="flex gap-2">
                <Button onClick={() => { setSysMessageSaved(true); toast("Mensagem salva", "Exibida para todos os admins"); setTimeout(() => setSysMessageSaved(false), 3000); }}
                  className="bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/20 h-9 gap-2">
                  <BookmarkSquareIcon className="h-4 w-4" />
                  {sysMessageSaved ? "Salvo!" : "Salvar Mensagem"}
                </Button>
                {sysMessage && <Button variant="ghost" onClick={() => setSysMessage("")} className="h-9 text-muted-foreground hover:text-foreground">Limpar</Button>}
              </div>
            </div>
          </Section>
        </motion.div>

        {/* ── 6. Export Logs ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.25 }}>
          <Section title="Exportar Logs" icon={ArrowDownTrayIcon} accent="#34d399" defaultOpen={false}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground/60">Baixe os audit logs filtrados como JSON ou CSV.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[10px] text-muted-foreground/50 uppercase tracking-widest block mb-1.5">Formato</label>
                  <select value={exportFormat} onChange={e => setExportFormat(e.target.value as "json" | "csv")} className="w-full h-9 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-sm text-foreground appearance-none">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground/50 uppercase tracking-widest block mb-1.5">Filtrar Nivel</label>
                  <select value={exportLevel} onChange={e => setExportLevel(e.target.value)} className="w-full h-9 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-sm text-foreground appearance-none">
                    <option value="">Todos</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground/50 uppercase tracking-widest block mb-1.5">Limite</label>
                  <Input value={exportLimit} onChange={e => setExportLimit(e.target.value)} className="bg-white/[0.03] border-white/8 h-9 text-sm" type="number" min="1" max="2000" />
                </div>
              </div>
              <Button onClick={handleExport} className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 h-9 gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Exportar {exportLimit} logs ({exportFormat.toUpperCase()})
              </Button>
            </div>
          </Section>
        </motion.div>

        {/* ── 7. Database ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.3 }}>
          <Section title="Banco de Dados" icon={CircleStackIcon} accent="#34d399" defaultOpen={false}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MiniStat label="Total Keys" value={settings?.stats?.totalKeys ?? "—"} />
                <MiniStat label="Ativas" value={settings?.stats?.activeKeys ?? "—"} color="#34d399" />
                <MiniStat label="Pendentes" value={settings?.stats?.pendingKeys ?? "—"} color="#fbbf24" />
                <MiniStat label="Expiradas" value={settings?.stats?.expiredKeys ?? "—"} color="#f87171" />
                <MiniStat label="Usuarios" value={settings?.stats?.totalUsers ?? "—"} />
                <MiniStat label="Vinculados" value={settings?.stats?.uniqueLinkedUsers ?? "—"} color="#60a5fa" />
                <MiniStat label="Vinculos" value={settings?.stats?.linkedUserProducts ?? "—"} color="#a78bfa" />
                <MiniStat label="Produtos" value={settings?.stats?.totalProducts ?? "—"} />
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Conexao MongoDB</p>
                  <Button variant="ghost" size="sm" onClick={load} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"><ArrowPathIcon className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground/50 mb-0.5">Estado</p>
                    <p className={`font-semibold ${settings?.system?.dbState === "connected" ? "text-green-400" : "text-red-400"}`}>{settings?.system?.dbState ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/50 mb-0.5">ReadyState</p>
                    <p className="font-mono font-semibold">{settings?.system?.dbReadyState ?? "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground/50 mb-0.5">Host</p>
                    <p className="font-mono text-[11px] text-foreground/60 break-all">{settings?.system?.dbHost ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/50 mb-0.5">Database</p>
                    <p className="font-mono font-semibold text-green-400/80">{settings?.system?.dbName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/50 mb-0.5">Versao Node</p>
                    <p className="font-mono font-semibold">{settings?.system?.node ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </motion.div>

      </main>
    </div>
  );
}
