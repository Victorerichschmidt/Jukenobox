import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/ui/data-table";
import { ItemModal } from "@/components/modals/item-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { setStoredUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileDown } from "lucide-react";
import type { Product } from "@shared/schema";

const productFields = [
  { name: 'nome', label: 'Nome do Produto', type: 'text' as const, required: true },
  { 
    name: 'categoria', 
    label: 'Categoria', 
    type: 'select' as const, 
    options: ['Caixas de Som', 'Fones de Ouvido', 'Amplificadores', 'Headsets', 'Microfones'], 
    required: true 
  },
  { name: 'preco', label: 'Preço (R$)', type: 'number' as const, step: '0.01', required: true },
  { name: 'estoque', label: 'Quantidade em Estoque', type: 'number' as const, required: true },
  { name: 'descricao', label: 'Descrição', type: 'textarea' as const }
];

const columns = [
  { header: 'ID', accessor: 'id' as keyof Product },
  { header: 'Nome', accessor: 'nome' as keyof Product },
  { header: 'Categoria', accessor: 'categoria' as keyof Product },
  { 
    header: 'Preço', 
    accessor: ((product: Product) => `R$ ${parseFloat(product.preco.toString()).toFixed(2).replace('.', ',')}`) as any
  },
  { 
    header: 'Estoque', 
    accessor: ((product: Product) => {
      const stock = parseInt(product.estoque.toString());
      const className = stock > 10 ? 'bg-green-100 text-green-800' : stock > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
          {stock}
        </span>
      );
    }) as any
  }
];

export default function Products() {
  const [, setLocation] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setShowModal(false);
      setEditingProduct(null);
      toast({
        title: "Produto adicionado com sucesso!"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar produto"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setShowModal(false);
      setEditingProduct(null);
      toast({
        title: "Produto atualizado com sucesso!"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar produto"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setShowConfirmModal(false);
      setDeletingProduct(null);
      toast({
        title: "Produto excluído com sucesso!"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto"
      });
    }
  });

  const handleLogout = () => {
    setStoredUser(null);
    setLocation("/login");
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setShowConfirmModal(true);
  };

  const handleModalSubmit = (data: any) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div>
      <Header showBackButton onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Gerenciamento de Produtos</h1>
            <p className="text-textLight text-lg">Controle completo do seu inventário</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="bg-secondary hover:bg-hover">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
            <Button variant="outline" className="bg-primary hover:bg-gray-700 text-white">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={products}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Pesquisar por nome, ID ou categoria..."
        />

        {/* Modals */}
        <ItemModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          title={editingProduct ? "Editar Produto" : "Adicionar Produto"}
          fields={productFields}
          initialData={editingProduct}
        />

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        />
      </main>
    </div>
  );
}
