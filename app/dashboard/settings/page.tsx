"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast-provider";
import { useSidebar } from "../layout";
import {
  PowerIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  GlobeAltIcon,
  BellIcon,
  CircleStackIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  BookmarkSquareIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import {
  setMaintenance, getSettings, getPrivacySettings, setPrivacySettings,
  getSecuritySettings, setSecuritySettings, getWebhookSettings, setWebhookSettings,
  type SettingsData, type PrivacySettings, type SecuritySettings, type WebhookSettings,
} from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

// ── Collapsible Section ──────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, accent, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  accent?: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white/[0.02] hover:bg-white/[0.035] transition-colors text-left">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ background: accent ? `${accent}18` : "rgba(255,255,255,0.05)" }}>
          <Icon className="h-4 w-4" style={{ color: accent ?? "#9ca3af" }} />
        </span>
        <span className="flex-1 text-sm font-semibold text-foreground">{title}</span>
        <ChevronDownIcon className={`h-4 w-4 text-muted-foreground/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 pt-4 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({ icon: Icon, title, desc, checked, onChange, loading, accent = "#9ca3af" }: {
  icon: React.ElementType; title: string; desc: string;
  checked: boolean; onChange: () => void; loading?: boolean; accent?: string;
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

// ── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-foreground/80">{value}</span>
        {onCopy && (
          <button onClick={onCopy} className="text-muted-foreground/40 hover:text-primary transition-colors">
            <ClipboardDocumentIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function MiniStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <p className="text-xl font-bold tabular-nums" style={{ color: color ?? "#fff" }}>{value}</p>
      <p className="text-[11px] text-muted-foreground/50 mt-0.5">{label}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
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

  // Webhook form
  const [wUrl, setWUrl] = useState("");
  const [wUser, setWUser] = useState("");
  const [wAvatar, setWAvatar] = useState("");
  const [wLevel, setWLevel] = useState<"INFO" | "WARN" | "ERROR">("INFO");
  const [wSensitive, setWSensitive] = useState(false);

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

  const toggleMaintenance = async () => {
    setMaintenanceLoading(true);
    const res = await setMaintenance(!maintenanceOn, maintenanceMsg);
    setMaintenanceLoading(false);
    if (res.success && res.data) {
      setMaintenanceOn(res.data.enabled);
      toast(res.data.enabled ? "Manutencao ativada" : "Manutencao desativada", res.data.enabled ? "API retornando 503" : "API voltou ao normal", res.data.enabled ? "warning" : "success");
    } else toast("Erro", res.message, "destructive");
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
    if (res.success && res.data) { setWebhook(res.data); toast("Webhook salvo", "Configuracoes atualizadas com sucesso"); }
    else toast("Erro", res.message, "destructive");
  };

  const toggleWebhook = async () => {
    if (!webhook) return;
    setWebhookLoading(true);
    const v = !webhook.enabled;
    const res = await setWebhookSettings({ enabled: v });
    setWebhookLoading(false);
    if (res.success && res.data) { setWebhook(res.data); toast(v ? "Webhook ativado" : "Webhook desativado", v ? "Notificacoes Discord on" : "Notificacoes Discord off"); }
    else toast("Erro", res.message, "destructive");
  };

  const copy = (v: string, l: string) => { navigator.clipboard.writeText(v); toast("Copiado!", `${l} na area de transferencia`); };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Configuracoes" description="Gerencie o sistema" onMenuClick={toggleSidebar} isMaintenanceMode={maintenanceOn} />
        <main className="p-4 lg:p-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
              className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Configuracoes" description="Gerencie o sistema, seguranca e webhooks" onMenuClick={toggleSidebar} isMaintenanceMode={maintenanceOn} />

      <main className="p-4 lg:p-6 space-y-3">

        {/* 1 — Maintenance */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Section title="Modo de Manutencao" icon={PowerIcon} accent={maintenanceOn ? "#f59e0b" : "#22c55e"}>
            <div className="space-y-4">
              {/* Status indicator */}
              <div className={`flex items-center gap-4 rounded-xl p-4 border transition-all duration-300 ${maintenanceOn ? "border-amber-500/20 bg-amber-500/5" : "border-green-500/20 bg-green-500/5"}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${maintenanceOn ? "bg-amber-500/15" : "bg-green-500/15"}`}>
                  {maintenanceOn
                    ? <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
                    : <CheckCircleIcon className="h-5 w-5 text-green-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{maintenanceOn ? "Sistema em Manutencao" : "Sistema Operacional"}</p>
                  <p className="text-xs text-muted-foreground/60">{maintenanceOn ? "API retornando 503 para todos os requests" : "API funcionando normalmente"}</p>
                </div>
                <Switch checked={maintenanceOn} onCheckedChange={toggleMaintenance} disabled={maintenanceLoading} />
              </div>

              <div>
                <label className="text-xs text-muted-foreground/50 uppercase tracking-widest block mb-2">Mensagem de Manutencao</label>
                <Input value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)}
                  placeholder="Sistema em manutencao, voltamos em breve."
                  className="bg-white/[0.03] border-white/8 h-10 text-sm" />
              </div>
            </div>
          </Section>
        </motion.div>

        {/* 2 — Security + API Info side by side */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.07 }}
          className="grid gap-3 lg:grid-cols-2">

          <Section title="Seguranca" icon={ShieldCheckIcon} accent="#dc2626">
            <div className="space-y-2">
              <ToggleRow icon={LockClosedIcon} title="HWID Lock Global" desc="Vincular todas as keys ao hardware" checked={security?.hwidLockGlobal ?? false} onChange={toggleSecurity} loading={securityLoading} accent="#dc2626" />
              <ToggleRow icon={ShieldCheckIcon} title="Modo Censura" desc="Ocultar dados sensiveis nas respostas" checked={privacy?.censorEnabled ?? false} onChange={togglePrivacy} loading={privacyLoading} accent="#dc2626" />
            </div>
          </Section>

          <Section title="Informacoes da API" icon={GlobeAltIcon} accent="#60a5fa">
            <div>
              <InfoRow label="Base URL" value={settings?.apiBaseUrl ?? "—"} onCopy={() => copy(settings?.apiBaseUrl ?? "", "Base URL")} />
              <InfoRow label="Versao" value={settings?.apiVersion ?? "—"} />
              <InfoRow label="Rate Limit" value={`${settings?.rateLimit ?? 100} req/min`} />
              <InfoRow label="Timeout" value={`${settings?.timeout ?? 30}s`} />
            </div>
          </Section>
        </motion.div>

        {/* 3 — Webhook */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.14 }}>
          <Section title="Webhook Discord" icon={LinkIcon} accent="#818cf8">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <p className="text-xs text-muted-foreground/50">Notificacoes em tempo real no Discord</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${webhook?.enabled ? "text-green-400 bg-green-500/10" : "text-gray-500 bg-white/5"}`}>
                    {webhook?.enabled ? "Ativo" : "Inativo"}
                  </span>
                  <Switch checked={webhook?.enabled ?? false} onCheckedChange={toggleWebhook} disabled={webhookLoading} />
                </div>
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
                  <select value={wLevel} onChange={e => setWLevel(e.target.value as "INFO" | "WARN" | "ERROR")}
                    className="w-full h-9 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-sm text-foreground appearance-none">
                    <option value="INFO">INFO — Todas as notificacoes</option>
                    <option value="WARN">WARN — Avisos e erros</option>
                    <option value="ERROR">ERROR — Apenas erros criticos</option>
                  </select>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Dados Sensiveis</p>
                    <p className="text-[11px] text-muted-foreground/50">Incluir keys/HWID nas notificacoes</p>
                  </div>
                  <Switch checked={wSensitive} onCheckedChange={setWSensitive} />
                </div>
              </div>

              <Button onClick={saveWebhook} disabled={webhookLoading} className="bg-primary hover:bg-primary/90 h-9 gap-2">
                {webhookLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <BookmarkSquareIcon className="h-4 w-4" />}
                Salvar Webhook
              </Button>
            </div>
          </Section>
        </motion.div>

        {/* 4 — Database */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.21 }}>
          <Section title="Status do Banco de Dados" icon={CircleStackIcon} accent="#34d399" defaultOpen={false}>
            <div className="space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MiniStat label="Total de Keys" value={settings?.stats?.totalKeys ?? "—"} />
                <MiniStat label="Keys Ativas" value={settings?.stats?.activeKeys ?? "—"} color="#34d399" />
                <MiniStat label="Pendentes" value={settings?.stats?.pendingKeys ?? "—"} color="#fbbf24" />
                <MiniStat label="Expiradas" value={settings?.stats?.expiredKeys ?? "—"} color="#f87171" />
                <MiniStat label="Usuarios" value={settings?.stats?.totalUsers ?? "—"} />
                <MiniStat label="Vinculados" value={settings?.stats?.uniqueLinkedUsers ?? "—"} color="#60a5fa" />
                <MiniStat label="Vinculos Produto" value={settings?.stats?.linkedUserProducts ?? "—"} color="#a78bfa" />
                <MiniStat label="Produtos" value={settings?.stats?.totalProducts ?? "—"} />
              </div>

              {/* MongoDB */}
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest">Conexao MongoDB</p>
                  <Button variant="ghost" size="sm" onClick={load} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                    <ArrowPathIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground/50 mb-0.5">Estado</p>
                    <p className={`font-semibold ${settings?.system?.dbState === "connected" ? "text-green-400" : "text-red-400"}`}>
                      {settings?.system?.dbState ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/50 mb-0.5">ReadyState</p>
                    <p className="font-mono font-semibold">{settings?.system?.dbReadyState ?? "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground/50 mb-0.5">Host</p>
                    <p className="font-mono text-[11px] text-foreground/70 break-all">{settings?.system?.dbHost ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/50 mb-0.5">Database</p>
                    <p className="font-mono font-semibold text-green-400/80">{settings?.system?.dbName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/50 mb-0.5">Uptime</p>
                    <p className="font-mono font-semibold">{settings?.system?.apiUptimeSec ? `${Math.floor(settings.system.apiUptimeSec / 3600)}h ${Math.floor((settings.system.apiUptimeSec % 3600) / 60)}m` : "—"}</p>
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
