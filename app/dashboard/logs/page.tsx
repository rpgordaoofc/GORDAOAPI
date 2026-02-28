"use client";

import React, { useEffect, useState, useCallback } from "react";

import { Header } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "../layout";
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Filter,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  Globe,
} from "lucide-react";
import { getAuditLogs, type AuditLogItem } from "@/lib/api";

function safeNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeDateString(v: unknown) {
  if (!v) return "-";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("pt-BR");
}

export default function AuditLogsPage() {
  const { toggle: toggleSidebar, sidebarOpen, setSidebarOpen } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAuditLogs(page, 25, {
        q: searchQuery || undefined,
        level: levelFilter || undefined,
        method: methodFilter || undefined,
      });

      if (response?.success && response?.data) {
        setLogs(Array.isArray(response.data.items) ? response.data.items : []);
        setTotalPages(safeNumber(response.data.pages) ?? 1);
        setTotal(safeNumber(response.data.total) ?? 0);
      } else {
        setLogs([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (e) {
      console.error("Erro ao carregar audit logs:", e);
      setLogs([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, levelFilter, methodFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "WARN":
        return "bg-warning/10 text-warning border-warning/30";
      default:
        return "bg-primary/10 text-primary border-primary/30";
    }
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case "POST":
        return "bg-success/10 text-success";
      case "PUT":
        return "bg-warning/10 text-warning";
      case "DELETE":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Audit Logs"
        description="Historico de eventos e acoes do sistema"
         onMenuClick={toggleSidebar}
      />

      <main className="p-6">
        {/* Search and Filters */}
        <Card className="mb-6 animate-slide-down">
          <CardContent className="py-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por evento, rota, requestId..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                Buscar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-transparent"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </form>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Level</label>
                  <select
                    value={levelFilter}
                    onChange={(e) => {
                      setLevelFilter(e.target.value);
                      setPage(1);
                    }}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Todos</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Metodo</label>
                  <select
                    value={methodFilter}
                    onChange={(e) => {
                      setMethodFilter(e.target.value);
                      setPage(1);
                    }}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Todos</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{total} registro(s) encontrado(s)</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="bg-transparent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="flex h-64 flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Nenhum log encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => {
              const id = String((log as any)._id ?? log.requestId ?? `${index}`);
              const latency = safeNumber((log as any).latencyMs); // pode vir null
              const statusCode = safeNumber((log as any).statusCode) ?? 0;

              return (
                <Card
                  key={id}
                  className="cursor-pointer transition-colors hover:bg-muted/50 animate-slide-up opacity-0"
                  style={{ animationDelay: `${index * 20}ms`, animationFillMode: "forwards" }}
                  onClick={() => setSelectedLog((prev) => (prev && (prev as any)._id === (log as any)._id ? null : log))}
                >
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      {getLevelIcon((log as any).level)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getLevelBadgeClass(
                              (log as any).level
                            )}`}
                          >
                            {(log as any).level}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs font-mono ${getMethodBadgeClass(
                              (log as any).method
                            )}`}
                          >
                            {(log as any).method}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground truncate">
                            {(log as any).route ?? "-"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm truncate">
                          <span className="font-medium">{(log as any).event ?? "-"}</span>
                          {(log as any).message ? (
                            <span className="text-muted-foreground"> - {(log as any).message}</span>
                          ) : null}
                        </p>
                      </div>

                      <div className="hidden text-right sm:block">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-mono ${
                            statusCode >= 400
                              ? "bg-destructive/10 text-destructive"
                              : statusCode >= 300
                              ? "bg-warning/10 text-warning"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {statusCode || "-"}
                        </span>

                        <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {latency === null ? "N/A" : `${latency.toFixed(1)}ms`}
                        </div>
                      </div>

                      <div className="hidden text-right lg:block">
                        <p className="text-xs text-muted-foreground">
                          {safeDateString((log as any).createdAt)}
                        </p>
                      </div>
                    </div>

                    {selectedLog && (selectedLog as any)._id === (log as any)._id && (
                      <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-muted-foreground">Request ID</p>
                            <p className="mt-1 font-mono text-xs">{(log as any).requestId ?? "-"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">IP</p>
                            <p className="mt-1 font-mono text-xs flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {(log as any).ip ?? "N/A"}
                            </p>
                          </div>

                          {(log as any).keyMasked ? (
                            <div>
                              <p className="text-muted-foreground">Key</p>
                              <p className="mt-1 font-mono text-xs">{(log as any).keyMasked}</p>
                            </div>
                          ) : null}

                          {(log as any).discordIdMasked ? (
                            <div>
                              <p className="text-muted-foreground">Discord ID</p>
                              <p className="mt-1 font-mono text-xs">{(log as any).discordIdMasked}</p>
                            </div>
                          ) : null}

                          {(log as any).hwidMasked ? (
                            <div>
                              <p className="text-muted-foreground">HWID</p>
                              <p className="mt-1 font-mono text-xs">{(log as any).hwidMasked}</p>
                            </div>
                          ) : null}

                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground">User Agent</p>
                            <p className="mt-1 font-mono text-xs break-words">
                              {(log as any).userAgent ?? "N/A"}
                            </p>
                          </div>
                        </div>

                        {(log as any).meta && Object.keys((log as any).meta).length > 0 ? (
                          <div className="mt-4 border-t border-border pt-4">
                            <p className="text-muted-foreground mb-2">Meta</p>
                            <pre className="rounded bg-muted p-2 text-xs overflow-x-auto">
                              {JSON.stringify((log as any).meta, null, 2)}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <span className="px-4 text-sm text-muted-foreground">
              Pagina {page} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="bg-transparent"
            >
              Proxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
