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
import type { Client } from "@shared/schema";

const clientFields = [
  { name: 'nome', label: 'Nome Completo', type: 'text' as const, required: true },
  { name: 'email', label: 'Email', type: 'email' as const, required: true },
  { name: 'telefone', label: 'Telefone', type: 'tel' as const, required: true },
  { name: 'cidade', label: 'Cidade', type: 'text' as const, required: true },
  { 
    name: 'status', 
    label: 'Status', 
    type: 'select' as const, 
    options: ['Ativo', 'Inativo'], 
    required: true 
  }
];

const columns = [
  { header: 'ID', accessor: 'id' as keyof Client },
  { header: 'Nome', accessor: 'nome' as keyof Client },
  { header: 'Email', accessor: 'email' as keyof Client },
  { header: 'Telefone', accessor: 'telefone' as keyof Client },
  { header: 'Cidade', accessor: 'cidade' as keyof Client },
  { 
    header: 'Status', 
    accessor: ((client: Client) => {
      const isActive = client.status === 'Ativo';
      const className = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
          {client.status}
        </span>
      );
    }) as any
  }
];

export default function Clients() {
  const [, setLocation] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setShowModal(false);
      setEditingClient(null);
      toast({
        title: "Cliente adicionado com sucesso!"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar cliente"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/clients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setShowModal(false);
      setEditingClient(null);
      toast({
        title: "Cliente atualizado com sucesso!"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cliente"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setShowConfirmModal(false);
      setDeletingClient(null);
      toast({
        title: "Cliente excluído com sucesso!"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir cliente"
      });
    }
  });

  const handleLogout = () => {
    setStoredUser(null);
    setLocation("/login");
  };

  const handleAdd = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = (client: Client) => {
    setDeletingClient(client);
    setShowConfirmModal(true);
  };

  const handleModalSubmit = (data: any) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingClient) {
      deleteMutation.mutate(deletingClient.id);
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
            <h1 className="text-3xl font-bold text-primary mb-2">Gerenciamento de Clientes</h1>
            <p className="text-textLight text-lg">Controle do relacionamento com clientes</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="bg-secondary hover:bg-hover">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
            <Button variant="outline" className="bg-primary hover:bg-gray-700 text-white">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={clients}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Pesquisar por nome, email ou cidade..."
        />

        {/* Modals */}
        <ItemModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          title={editingClient ? "Editar Cliente" : "Adicionar Cliente"}
          fields={clientFields}
          initialData={editingClient}
        />

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        />
      </main>
    </div>
  );
}
