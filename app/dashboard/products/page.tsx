"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { useSidebar } from "../layout";
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductHwidLock,
  type Product,
} from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProductWithHwid extends Product {
  hwidLockEnabled?: boolean;
}

export default function ProductsPage() {
  const { toggle: toggleSidebar, sidebarOpen, setSidebarOpen } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithHwid[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithHwid | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductHwidLock, setNewProductHwidLock] = useState(true);
  const [editProductName, setEditProductName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    const response = await getProducts(page, 25, searchQuery || undefined);
    
    if (response.success && response.data) {
      setProducts(response.data.items.map((p) => ({
        ...p,
        hwidLockEnabled: typeof p.hwidLockEnabled === "boolean" ? p.hwidLockEnabled : true,
      })));
      setTotalPages(response.data.pages);
      setTotal(response.data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) {
      addToast({
        title: "Erro",
        description: "Nome do produto e obrigatorio",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    const response = await createProduct(newProductName.trim(), newProductHwidLock);
    setActionLoading(false);

    if (response.success) {
      addToast({
        title: "Produto criado",
        description: `Produto "${newProductName}" criado com sucesso`,
        variant: "success",
      });
      setCreateModalOpen(false);
      setNewProductName("");
      setNewProductHwidLock(true);
      fetchProducts();
    } else {
      addToast({
        title: "Erro",
        description: response.message || "Erro ao criar produto",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct || !editProductName.trim()) return;

    setActionLoading(true);
    const response = await updateProduct(selectedProduct._id, { name: editProductName.trim() });
    setActionLoading(false);

    if (response.success) {
      addToast({
        title: "Produto atualizado",
        description: `Produto renomeado para "${editProductName}"`,
        variant: "success",
      });
      setEditModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } else {
      addToast({
        title: "Erro",
        description: response.message || "Erro ao atualizar produto",
        variant: "destructive",
      });
    }
  };

  const handleToggleHwidLock = async (product: ProductWithHwid) => {
    const newState = !product.hwidLockEnabled;
    const response = await setProductHwidLock(product._id, newState);

    if (response.success) {
      addToast({
        title: newState ? "HWID Lock Ativado" : "HWID Lock Desativado",
        description: `HWID Lock ${newState ? "ativado" : "desativado"} para "${product.name}"`,
        variant: "success",
      });
      setProducts(prev => 
        prev.map(p => p._id === product._id ? { ...p, hwidLockEnabled: newState } : p)
      );
    } else {
      addToast({
        title: "Erro",
        description: response.message || "Erro ao alterar HWID Lock",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (product: ProductWithHwid) => {
    setSelectedProduct(product);
    setEditProductName(product.name);
    setEditModalOpen(true);
  };

  const handleDeleteProduct = async (product: ProductWithHwid) => {
    const confirmed = window.confirm(`Tem certeza que deseja apagar o produto "${product.name}"?`);
    if (!confirmed) return;

    setActionLoading(true);
    const response = await deleteProduct(product._id);
    setActionLoading(false);

    if (response.success) {
      addToast({
        title: "Produto apagado",
        description: `Produto "${product.name}" removido com sucesso`,
        variant: "success",
      });
      fetchProducts();
      return;
    }

    addToast({
      title: "Erro",
      description: response.message || "Erro ao apagar produto",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Produtos"
        description="Gerencie os produtos do sistema"
         onMenuClick={toggleSidebar}
      />

      <main className="p-6">
        {/* Search Bar */}
        <Card className="mb-6 animate-slide-down">
          <CardContent className="py-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou ID do produto..."
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
                onClick={() => setCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Criar Produto</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Products Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} produto(s) encontrado(s)
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={loading}
            className="bg-transparent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex h-64 flex-col items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Nenhum produto encontrado
              </p>
              <Button
                className="mt-4"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <Card
                key={product._id}
                className="animate-slide-up opacity-0"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground break-all">
                          {product.productHash || "-"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-transparent">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openEditModal(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Renomear
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleHwidLock(product)}>
                          {product.hwidLockEnabled ? (
                            <>
                              <Unlock className="mr-2 h-4 w-4" />
                              Desativar HWID Lock
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Ativar HWID Lock
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Apagar produto
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2.5">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">HWID Lock</span>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.hwidLockEnabled 
                          ? "bg-success/10 text-success" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {product.hwidLockEnabled ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Criado em</p>
                        <p className="mt-1 flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(product.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Atualizado em</p>
                        <p className="mt-1 flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(product.updatedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

      {/* Create Product Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Criar Novo Produto</ModalTitle>
          <ModalDescription>
            Preencha os dados para criar um novo produto
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome do Produto</label>
            <Input
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="Ex: Premium, Basic, Pro..."
              className="mt-1.5"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <div>
              <p className="text-sm font-medium">HWID Lock</p>
              <p className="text-xs text-muted-foreground">Vincular licencas ao hardware</p>
            </div>
            <Switch
              checked={newProductHwidLock}
              onCheckedChange={setNewProductHwidLock}
            />
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setCreateModalOpen(false)}
            disabled={actionLoading}
            className="bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateProduct}
            disabled={actionLoading || !newProductName.trim()}
          >
            {actionLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </span>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Criar Produto
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Renomear Produto</ModalTitle>
          <ModalDescription>
            Altere o nome do produto
          </ModalDescription>
        </ModalHeader>
        
        <div>
          <label className="text-sm font-medium">Nome do Produto</label>
          <Input
            type="text"
            value={editProductName}
            onChange={(e) => setEditProductName(e.target.value)}
            placeholder="Novo nome do produto"
            className="mt-1.5"
          />
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setEditModalOpen(false)}
            disabled={actionLoading}
            className="bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEditProduct}
            disabled={actionLoading || !editProductName.trim()}
          >
            {actionLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </span>
            ) : (
              "Salvar"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
