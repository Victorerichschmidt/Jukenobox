import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { setStoredUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, Plus, Minus, Trash2, ShoppingBag, 
  Package, DollarSign, CheckCircle, AlertCircle 
} from "lucide-react";
import type { Product, Client } from "@shared/schema";

interface CartItemWithProduct {
  id: number;
  produtoId: number;
  quantidade: number;
  produto?: Product;
}

export default function Sales() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    setStoredUser(null);
    setLocation("/login");
  };

  // Consultas
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    refetchInterval: 2000 // Atualizar carrinho a cada 2 segundos
  });

  // Mutações
  const addToCartMutation = useMutation({
    mutationFn: (data: { produtoId: number; quantidade?: number }) => 
      apiRequest("/api/cart", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ description: "Produto adicionado ao carrinho" });
    },
    onError: () => {
      toast({ 
        description: "Erro ao adicionar produto ao carrinho",
        variant: "destructive" 
      });
    }
  });

  const updateCartMutation = useMutation({
    mutationFn: (data: { id: number; quantidade: number }) => 
      apiRequest(`/api/cart/${data.id}`, { method: "PUT", body: { quantidade: data.quantidade } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/cart/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ description: "Produto removido do carrinho" });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: { clienteId?: number; observacoes?: string; items: any[] }) => 
      apiRequest("/api/orders", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setIsCheckoutOpen(false);
      setSelectedClientId("");
      setObservacoes("");
      toast({ 
        description: "Pedido realizado com sucesso! Estoque atualizado.",
        duration: 5000 
      });
    },
    onError: () => {
      toast({ 
        description: "Erro ao processar pedido",
        variant: "destructive" 
      });
    }
  });

  // Filtros
  const categories = [...new Set(products.map(p => p.categoria))];
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cálculos do carrinho
  const cartTotal = cartItems.reduce((total, item) => {
    if (item.produto) {
      return total + (parseFloat(item.produto.preco.toString()) * item.quantidade);
    }
    return total;
  }, 0);

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantidade, 0);

  const handleAddToCart = (produtoId: number) => {
    addToCartMutation.mutate({ produtoId, quantidade: 1 });
  };

  const handleUpdateQuantity = (id: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeFromCartMutation.mutate(id);
    } else {
      updateCartMutation.mutate({ id, quantidade });
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({ 
        description: "Carrinho está vazio",
        variant: "destructive" 
      });
      return;
    }

    const items = cartItems.map(item => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade
    }));

    createOrderMutation.mutate({
      clienteId: selectedClientId ? parseInt(selectedClientId) : undefined,
      observacoes,
      items
    });
  };

  return (
    <div>
      <Header showBackButton onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Sistema de Vendas</h1>
            <p className="text-textLight text-lg">Adicione produtos ao carrinho e finalize a compra</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsCheckoutOpen(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={cartItems.length === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Finalizar Compra ({cartItemsCount})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Produtos */}
          <div className="xl:col-span-2">
            {/* Filtros */}
            <Card className="shadow-md mb-6">
              <CardHeader>
                <CardTitle className="text-primary">Filtrar Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="search">Buscar produtos</Label>
                    <Input
                      id="search"
                      placeholder="Digite o nome do produto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => {
                const stock = parseInt(product.estoque.toString());
                const isLowStock = stock < 5;
                const isOutOfStock = stock === 0;

                return (
                  <Card key={product.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg text-primary line-clamp-2">
                          {product.nome}
                        </CardTitle>
                        <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"}>
                          {product.categoria}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-green-600">
                            R$ {parseFloat(product.preco.toString()).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-textLight" />
                            <span className={`text-sm ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-textLight'}`}>
                              {stock} em estoque
                            </span>
                          </div>
                        </div>
                        
                        {product.descricao && (
                          <p className="text-sm text-textLight line-clamp-2">
                            {product.descricao}
                          </p>
                        )}

                        <Button 
                          onClick={() => handleAddToCart(product.id)}
                          disabled={isOutOfStock || addToCartMutation.isPending}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {isOutOfStock ? "Sem Estoque" : "Adicionar ao Carrinho"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Carrinho */}
          <div className="xl:col-span-1">
            <Card className="shadow-md sticky top-4">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrinho ({cartItemsCount} {cartItemsCount === 1 ? 'item' : 'itens'})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-textLight">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Carrinho vazio</p>
                    <p className="text-sm">Adicione produtos para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-primary line-clamp-1">
                            {item.produto?.nome || 'Produto não encontrado'}
                          </h4>
                          <p className="text-sm text-textLight">
                            R$ {item.produto ? parseFloat(item.produto.preco.toString()).toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.id, item.quantidade - 1)}
                            disabled={updateCartMutation.isPending}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantidade}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.id, item.quantidade + 1)}
                            disabled={updateCartMutation.isPending}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCartMutation.mutate(item.id)}
                            disabled={removeFromCartMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">R$ {cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Checkout */}
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Finalizar Pedido
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente (opcional)</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais sobre o pedido..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumo do Pedido</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total de itens:</span>
                    <span>{cartItemsCount}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Valor total:</span>
                    <span className="text-green-600">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createOrderMutation.isPending ? "Processando..." : "Confirmar Pedido"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}