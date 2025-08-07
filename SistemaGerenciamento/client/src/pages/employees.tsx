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
import type { Employee } from "@shared/schema";

const employeeFields = [
  { name: 'nome', label: 'Nome Completo', type: 'text' as const, required: true },
  { name: 'cargo', label: 'Cargo', type: 'text' as const, required: true },
  { 
    name: 'departamento', 
    label: 'Departamento', 
    type: 'select' as const, 
    options: ['Vendas', 'Suporte', 'Administrativo', 'Financeiro'], 
    required: true 
  },
  { name: 'salario', label: 'Salário (R$)', type: 'number' as const, step: '0.01', required: true },
  { name: 'dataAdmissao', label: 'Data de Admissão', type: 'date' as const, required: true }
];

const columns = [
  { header: 'ID', accessor: 'id' as keyof Employee },
  { header: 'Nome', accessor: 'nome' as keyof Employee },
  { header: 'Cargo', accessor: 'cargo' as keyof Employee },
  { header: 'Departamento', accessor: 'departamento' as keyof Employee },
  { 
    header: 'Salário', 
    accessor: ((employee: Employee) => `R$ ${parseFloat(employee.salario.toString()).toFixed(2).replace('.', ',')}`) as any
  },
  { 
    header: 'Data Admissão', 
    accessor: ((employee: Employee) => new Date(employee.dataAdmissao).toLocaleDateString('pt-BR')) as any
  }
];

export default function Employees() {
  const [, setLocation] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"]
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/employees", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setShowModal(false);
      setEditingEmployee(null);
      toast({
        title: "Funcionário adicionado com sucesso!"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar funcionário"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setShowModal(false);
      setEditingEmployee(null);
      toast({
        title: "Funcionário atualizado com sucesso!"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar funcionário"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setShowConfirmModal(false);
      setDeletingEmployee(null);
      toast({
        title: "Funcionário excluído com sucesso!"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir funcionário"
      });
    }
  });

  const handleLogout = () => {
    setStoredUser(null);
    setLocation("/login");
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = (employee: Employee) => {
    setDeletingEmployee(employee);
    setShowConfirmModal(true);
  };

  const handleModalSubmit = (data: any) => {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingEmployee) {
      deleteMutation.mutate(deletingEmployee.id);
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
            <h1 className="text-3xl font-bold text-primary mb-2">Gerenciamento de Funcionários</h1>
            <p className="text-textLight text-lg">Gestão de recursos humanos</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="bg-secondary hover:bg-hover">
              <Plus className="w-4 h-4 mr-2" />
              Novo Funcionário
            </Button>
            <Button variant="outline" className="bg-primary hover:bg-gray-700 text-white">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={employees}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Pesquisar por nome, cargo ou departamento..."
        />

        {/* Modals */}
        <ItemModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          title={editingEmployee ? "Editar Funcionário" : "Adicionar Funcionário"}
          fields={employeeFields}
          initialData={editingEmployee}
        />

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita."
        />
      </main>
    </div>
  );
}
