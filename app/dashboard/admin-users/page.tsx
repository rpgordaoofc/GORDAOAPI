"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/header";
import { useSidebar } from "../layout";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ownerListAdmins,
  ownerCreateAdmin,
  ownerUpdateAdmin,
  ownerDeleteAdmin,
  type OwnerAdminUser,
} from "@/lib/api";
import {
  ArrowPathIcon as Loader2,
  ShieldCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  UserPlusIcon,
  CheckCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/solid";

const ROLE_OPTIONS = ["OWNER", "SUPER_ADMIN", "ADMIN", "SUPPORT", "VIEWER"] as const;
const STATUS_OPTIONS = ["ACTIVE", "DISABLED"] as const;

const ROLE_COLORS: Record<string, string> = {
  OWNER: "text-yellow-400 bg-yellow-400/10",
  SUPER_ADMIN: "text-orange-400 bg-orange-400/10",
  ADMIN: "text-blue-400 bg-blue-400/10",
  SUPPORT: "text-green-400 bg-green-400/10",
  VIEWER: "text-gray-400 bg-gray-400/10",
};

interface EditState {
  id: string;
  displayName: string;
  password: string;
  role: typeof ROLE_OPTIONS[number];
  status: typeof STATUS_OPTIONS[number];
}

export default function AdminUsersPage() {
  const { toggle: toggleSidebar } = useSidebar();
  const { admin } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<OwnerAdminUser[]>([]);
  const [editModal, setEditModal] = useState<EditState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OwnerAdminUser | null>(null);

  // Create form
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<typeof ROLE_OPTIONS[number]>("ADMIN");
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("ACTIVE");

  const isOwner = admin?.role === "OWNER";

  const fetchAdmins = async () => {
    setLoading(true);
    const response = await ownerListAdmins();
    if (response.success && response.data) {
      setItems(response.data.items);
    } else {
      addToast({ title: "Erro", description: response.message || "Falha ao carregar admins", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOwner) void fetchAdmins();
    else setLoading(false);
  }, [isOwner]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setSaving(true);
    const response = await ownerCreateAdmin({
      username: username.trim(),
      password,
      displayName: displayName.trim() || undefined,
      role,
      status,
    });
    setSaving(false);
    if (response.success) {
      setUsername(""); setDisplayName(""); setPassword(""); setRole("ADMIN"); setStatus("ACTIVE");
      addToast({ title: "Admin criado!", description: `@${username} adicionado com sucesso`, variant: "success" });
      await fetchAdmins();
    } else {
      addToast({ title: "Erro ao criar", description: response.message || "Falha ao criar admin", variant: "destructive" });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setSaving(true);
    const payload: Parameters<typeof ownerUpdateAdmin>[1] = {
      displayName: editModal.displayName || undefined,
      role: editModal.role,
      status: editModal.status,
    };
    if (editModal.password.trim()) payload.password = editModal.password;
    const response = await ownerUpdateAdmin(editModal.id, payload);
    setSaving(false);
    if (response.success) {
      setEditModal(null);
      addToast({ title: "Atualizado!", description: "Admin atualizado com sucesso", variant: "success" });
      await fetchAdmins();
    } else {
      addToast({ title: "Erro", description: response.message || "Falha ao atualizar", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const response = await ownerDeleteAdmin(deleteTarget.id);
    setSaving(false);
    if (response.success) {
      setDeleteTarget(null);
      addToast({ title: "Removido!", description: `Admin @${deleteTarget.username} removido`, variant: "success" });
      await fetchAdmins();
    } else {
      addToast({ title: "Erro", description: response.message || "Falha ao remover", variant: "destructive" });
    }
  };

  const toggleStatus = async (item: OwnerAdminUser) => {
    setSaving(true);
    const next = item.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const response = await ownerUpdateAdmin(item.id, { status: next });
    setSaving(false);
    if (response.success) {
      addToast({ title: "Atualizado", description: `${item.displayName} → ${next}`, variant: "success" });
      await fetchAdmins();
    } else {
      addToast({ title: "Erro", description: response.message || "Falha ao atualizar", variant: "destructive" });
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen">
        <Header title="Admins" description="Acesso restrito ao OWNER" onMenuClick={toggleSidebar} />
        <main className="p-6">
          <div className="rounded-xl border border-white/5 bg-white/3 p-10 text-center text-muted-foreground">
            Apenas OWNER pode acessar esta área.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Admins" description="Criar e gerenciar usuários administrativos" onMenuClick={toggleSidebar} />

      <main className="p-4 lg:p-6 space-y-6">

        {/* Create form */}
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold mb-4">
            <UserPlusIcon className="h-4 w-4 text-primary" />
            Criar novo admin
          </h2>
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={saving} className="bg-white/5 border-white/10" />
            <Input placeholder="Nome de exibição" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={saving} className="bg-white/5 border-white/10" />
            <Input placeholder="Senha (mínimo 10)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={saving} className="bg-white/5 border-white/10" />
            <select value={role} onChange={(e) => setRole(e.target.value as typeof ROLE_OPTIONS[number])} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground" disabled={saving}>
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof STATUS_OPTIONS[number])} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground" disabled={saving}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button type="submit" disabled={saving || !username.trim() || !password.trim()} className="sm:col-span-2 bg-primary hover:bg-primary/90">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlusIcon className="mr-2 h-4 w-4" />}
              Criar admin
            </Button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold mb-4">
            <ShieldCheckIcon className="h-4 w-4 text-primary" />
            Admins cadastrados
            <span className="ml-auto text-xs text-muted-foreground font-normal">{items.length} admin(s)</span>
          </h2>

          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum admin cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
                  {/* Avatar inicial */}
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary uppercase">{item.displayName[0]}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{item.displayName}</p>
                      <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${ROLE_COLORS[item.role] ?? "text-gray-400 bg-gray-400/10"}`}>
                        {item.role}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${item.status === "ACTIVE" ? "text-green-400 bg-green-400/10" : "text-gray-500 bg-gray-500/10"}`}>
                        {item.status === "ACTIVE" ? <CheckCircleIcon className="h-2.5 w-2.5" /> : <NoSymbolIcon className="h-2.5 w-2.5" />}
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">@{item.username}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle status */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void toggleStatus(item)}
                      disabled={saving || item.role === "OWNER"}
                      className={`h-8 px-3 text-xs ${item.status === "ACTIVE" ? "text-muted-foreground hover:text-orange-400" : "text-muted-foreground hover:text-green-400"}`}
                    >
                      {item.status === "ACTIVE" ? "Desativar" : "Ativar"}
                    </Button>

                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditModal({ id: item.id, displayName: item.displayName, password: "", role: item.role, status: item.status })}
                      disabled={saving || item.role === "OWNER"}
                      className="h-8 w-8 text-muted-foreground hover:text-blue-400"
                      title="Editar"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(item)}
                      disabled={saving || item.role === "OWNER"}
                      className="h-8 w-8 text-muted-foreground hover:text-red-400"
                      title="Excluir"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#111] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="flex items-center gap-2 font-bold">
                <PencilSquareIcon className="h-4 w-4 text-primary" />
                Editar admin
              </h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditModal(null)}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nome de exibição</label>
                <Input value={editModal.displayName} onChange={(e) => setEditModal({ ...editModal, displayName: e.target.value })} disabled={saving} className="bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nova senha (deixe em branco para não alterar)</label>
                <Input type="password" placeholder="••••••••••" value={editModal.password} onChange={(e) => setEditModal({ ...editModal, password: e.target.value })} disabled={saving} className="bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                <select value={editModal.role} onChange={(e) => setEditModal({ ...editModal, role: e.target.value as typeof ROLE_OPTIONS[number] })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground" disabled={saving}>
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Modo de exibição / Status</label>
                <select value={editModal.status} onChange={(e) => setEditModal({ ...editModal, status: e.target.value as typeof STATUS_OPTIONS[number] })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground" disabled={saving}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1 border-white/10 bg-transparent" onClick={() => setEditModal(null)}>Cancelar</Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary/90">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-xl border border-white/10 bg-[#111] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <TrashIcon className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold">Excluir admin</h3>
                <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Tem certeza que deseja excluir <span className="text-foreground font-semibold">@{deleteTarget.username}</span>?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-white/10 bg-transparent" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrashIcon className="mr-2 h-4 w-4" />}
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
