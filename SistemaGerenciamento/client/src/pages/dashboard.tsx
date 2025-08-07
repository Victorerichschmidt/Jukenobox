import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { setStoredUser } from "@/lib/auth";
import { Plus, TrendingUp, Package, Users, UserCheck, ShoppingCart, Warehouse, PieChart } from "lucide-react";

interface Statistics {
  products: number;
  clients: number;
  employees: number;
  sales: number;
  lowStock: number;
}

interface DashboardCardProps {
  title: string;
  description: string;
  count: string;
  icon: React.ReactNode;
  iconColor: string;
  borderColor: string;
  module: string;
  onClick: () => void;
}

function DashboardCard({ title, description, count, icon, iconColor, borderColor, module, onClick }: DashboardCardProps) {
  return (
    <Card className="shadow-md card-hover cursor-pointer overflow-hidden" onClick={onClick}>
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
        <p className="text-textLight mb-3">{description}</p>
        <div className={`text-sm font-medium ${borderColor.replace('border-', 'text-')}`}>{count}</div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

function StatCard({ label, value, icon, color, borderColor }: StatCardProps) {
  return (
    <Card className={`shadow-md border-l-4 ${borderColor}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-textLight text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-primary">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-500', '-100')}`}>
            <div className={`${color} text-xl`}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Type-safe default values for stats
  const statsData: Statistics = stats || {
    products: 0,
    clients: 0,
    employees: 0,
    sales: 0,
    lowStock: 0
  };

  const handleLogout = () => {
    setStoredUser(null);
    setLocation("/login");
  };

  const navigateToModule = (module: string) => {
    setLocation(`/${module}`);
  };

  return (
    <div>
      <Header onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Painel Administrativo</h1>
              <p className="text-textLight text-lg">Bem-vindo ao sistema de gerenciamento integrado</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-secondary hover:bg-hover">
                <Plus className="w-4 h-4 mr-2" />
                Novo Item
              </Button>
              <Button variant="outline" className="bg-primary hover:bg-gray-700 text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in">
          <StatCard
            label="Total de Produtos"
            value={statsData.products}
            icon={<Package />}
            color="text-secondary"
            borderColor="border-secondary"
          />
          <StatCard
            label="Clientes Ativos"
            value={statsData.clients}
            icon={<Users />}
            color="text-green-500"
            borderColor="border-green-500"
          />
          <StatCard
            label="Funcionários"
            value={statsData.employees}
            icon={<UserCheck />}
            color="text-purple-500"
            borderColor="border-purple-500"
          />
          <StatCard
            label="Vendas Hoje"
            value={statsData.sales}
            icon={<ShoppingCart />}
            color="text-orange-500"
            borderColor="border-orange-500"
          />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
          <DashboardCard
            title="Produtos"
            description="Gerenciamento completo de produtos e inventário"
            count={`${statsData.products} itens cadastrados`}
            icon={<Package className="text-2xl" />}
            iconColor="bg-blue-100"
            borderColor="border-secondary"
            module="products"
            onClick={() => navigateToModule("products")}
          />

          <DashboardCard
            title="Clientes"
            description="Controle de relacionamento com clientes"
            count={`${statsData.clients} clientes ativos`}
            icon={<Users className="text-2xl" />}
            iconColor="bg-green-100"
            borderColor="border-green-500"
            module="clients"
            onClick={() => navigateToModule("clients")}
          />

          <DashboardCard
            title="Funcionários"
            description="Gestão de recursos humanos e equipe"
            count={`${statsData.employees} colaboradores`}
            icon={<UserCheck className="text-2xl" />}
            iconColor="bg-purple-100"
            borderColor="border-purple-500"
            module="employees"
            onClick={() => navigateToModule("employees")}
          />

          <DashboardCard
            title="Estoque"
            description="Controle de estoque e movimentações"
            count={`${statsData.lowStock} alertas de baixo estoque`}
            icon={<Warehouse className="text-2xl" />}
            iconColor="bg-orange-100"
            borderColor="border-orange-500"
            module="stock"
            onClick={() => navigateToModule("stock")}
          />

          <DashboardCard
            title="Vendas"
            description="Processamento de vendas e transações"
            count={`${statsData.sales} vendas hoje`}
            icon={<ShoppingCart className="text-2xl" />}
            iconColor="bg-red-100"
            borderColor="border-red-500"
            module="sales"
            onClick={() => navigateToModule("sales")}
          />

          <DashboardCard
            title="Relatórios"
            description="Analytics e insights do negócio"
            count="Dashboards interativos"
            icon={<PieChart className="text-2xl" />}
            iconColor="bg-indigo-100"
            borderColor="border-indigo-500"
            module="reports"
            onClick={() => navigateToModule("reports")}
          />

          <DashboardCard
            title="Relatórios"
            description="Análises e relatórios estatísticos"
            count="10 modelos disponíveis"
            icon={<PieChart className="text-2xl" />}
            iconColor="bg-indigo-100"
            borderColor="border-indigo-500"
            module="reports"
            onClick={() => navigateToModule("reports")}
          />
        </div>
      </main>
    </div>
  );
}
