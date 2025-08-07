import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { setStoredUser } from "@/lib/auth";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { FileDown, TrendingUp, Package, Users, UserCheck, Calendar } from "lucide-react";
import type { Product, Client, Employee } from "@shared/schema";

// Cores para os gráficos
const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];

export default function Reports() {
  const [, setLocation] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"]
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/statistics"]
  });

  const handleLogout = () => {
    setStoredUser(null);
    setLocation("/login");
  };

  // Processamento de dados para gráficos
  const productsByCategory = products.reduce((acc: any[], product) => {
    const existing = acc.find(item => item.categoria === product.categoria);
    if (existing) {
      existing.quantidade += 1;
      existing.valor += parseFloat(product.preco.toString());
    } else {
      acc.push({
        categoria: product.categoria,
        quantidade: 1,
        valor: parseFloat(product.preco.toString())
      });
    }
    return acc;
  }, []);

  const stockLevels = products.map(product => ({
    nome: product.nome.length > 15 ? product.nome.substring(0, 15) + '...' : product.nome,
    estoque: parseInt(product.estoque.toString()),
    categoria: product.categoria
  })).sort((a, b) => a.estoque - b.estoque);

  const employeesByDepartment = employees.reduce((acc: any[], employee) => {
    const existing = acc.find(item => item.departamento === employee.departamento);
    if (existing) {
      existing.quantidade += 1;
      existing.salarioTotal += parseFloat(employee.salario.toString());
    } else {
      acc.push({
        departamento: employee.departamento,
        quantidade: 1,
        salarioTotal: parseFloat(employee.salario.toString())
      });
    }
    return acc;
  }, []);

  const clientsByCity = clients.reduce((acc: any[], client) => {
    const existing = acc.find(item => item.cidade === client.cidade);
    if (existing) {
      existing.quantidade += 1;
    } else {
      acc.push({
        cidade: client.cidade,
        quantidade: 1
      });
    }
    return acc;
  }, []);

  const salesTrend = [
    { mes: 'Jan', vendas: 45, meta: 50 },
    { mes: 'Fev', vendas: 52, meta: 55 },
    { mes: 'Mar', vendas: 48, meta: 60 },
    { mes: 'Abr', vendas: 61, meta: 65 },
    { mes: 'Mai', vendas: 55, meta: 70 },
    { mes: 'Jun', vendas: 67, meta: 75 }
  ];

  const revenueData = [
    { mes: 'Jan', receita: 12500, custos: 8000, lucro: 4500 },
    { mes: 'Fev', receita: 15800, custos: 9200, lucro: 6600 },
    { mes: 'Mar', receita: 14200, custos: 8800, lucro: 5400 },
    { mes: 'Abr', receita: 18900, custos: 11000, lucro: 7900 },
    { mes: 'Mai', receita: 16700, custos: 9800, lucro: 6900 },
    { mes: 'Jun', receita: 21200, custos: 12500, lucro: 8700 }
  ];

  return (
    <div>
      <Header showBackButton onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Relatórios e Analytics</h1>
            <p className="text-textLight text-lg">Análise detalhada do desempenho do negócio</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white text-primary"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
            <Button className="bg-secondary hover:bg-hover">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textLight text-sm font-medium">Receita Total</p>
                  <p className="text-2xl font-bold text-primary">R$ 98.300</p>
                  <p className="text-green-600 text-sm mt-1">↑ 15% vs mês anterior</p>
                </div>
                <TrendingUp className="text-secondary text-3xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textLight text-sm font-medium">Ticket Médio</p>
                  <p className="text-2xl font-bold text-primary">R$ 285</p>
                  <p className="text-green-600 text-sm mt-1">↑ 8% vs mês anterior</p>
                </div>
                <Package className="text-green-500 text-3xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textLight text-sm font-medium">Taxa Conversão</p>
                  <p className="text-2xl font-bold text-primary">12.4%</p>
                  <p className="text-red-600 text-sm mt-1">↓ 2% vs mês anterior</p>
                </div>
                <Users className="text-purple-500 text-3xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textLight text-sm font-medium">Satisfação</p>
                  <p className="text-2xl font-bold text-primary">4.8/5</p>
                  <p className="text-green-600 text-sm mt-1">↑ 0.3 vs mês anterior</p>
                </div>
                <UserCheck className="text-orange-500 text-3xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Produtos por Categoria */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-primary">Produtos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" fill="#3498db" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Funcionários por Departamento */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-primary">Distribuição por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={employeesByDepartment}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ departamento, quantidade }) => `${departamento}: ${quantidade}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {employeesByDepartment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Segunda linha de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Níveis de Estoque */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-primary">Níveis de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockLevels.slice(0, 8)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="estoque" fill={(entry) => {
                    return entry.estoque < 5 ? '#e74c3c' : entry.estoque < 10 ? '#f39c12' : '#2ecc71';
                  }}>
                    {stockLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.estoque < 5 ? '#e74c3c' : 
                        entry.estoque < 10 ? '#f39c12' : '#2ecc71'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Clientes por Cidade */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-primary">Clientes por Cidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientsByCity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cidade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#9b59b6" name="Clientes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Tendência */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tendência de Vendas */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-primary">Tendência de Vendas vs Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="vendas" stroke="#3498db" strokeWidth={3} name="Vendas Realizadas" />
                  <Line type="monotone" dataKey="meta" stroke="#e74c3c" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Análise Financeira */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-primary">Análise Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`R$ ${value.toLocaleString()}`, name]} />
                  <Legend />
                  <Area type="monotone" dataKey="receita" stackId="1" stroke="#2ecc71" fill="#2ecc71" fillOpacity={0.6} name="Receita" />
                  <Area type="monotone" dataKey="custos" stackId="2" stroke="#e74c3c" fill="#e74c3c" fillOpacity={0.6} name="Custos" />
                  <Line type="monotone" dataKey="lucro" stroke="#f39c12" strokeWidth={3} name="Lucro" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights e Recomendações */}
        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Insights e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-primary mb-2">📈 Crescimento</h3>
                <p className="text-sm text-textLight">
                  As vendas de {productsByCategory[0]?.categoria || 'produtos'} aumentaram 25% este mês. 
                  Considere expandir este segmento.
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-semibold text-primary mb-2">⚠️ Atenção</h3>
                <p className="text-sm text-textLight">
                  {stockLevels.filter(p => p.estoque < 5).length} produtos com estoque baixo. 
                  Reabasteça para evitar perdas de vendas.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold text-primary mb-2">💡 Oportunidade</h3>
                <p className="text-sm text-textLight">
                  {clientsByCity[0]?.cidade || 'São Paulo'} tem o maior número de clientes. 
                  Foque campanhas de marketing nesta região.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}