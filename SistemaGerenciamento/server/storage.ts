import { 
  type User, type InsertUser, type Product, type InsertProduct, type Client, type InsertClient, 
  type Employee, type InsertEmployee, type Sale, type InsertSale, type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Sales
  getSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Cart
  getCartItems(): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(): Promise<boolean>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<number, Product>;
  private clients: Map<number, Client>;
  private employees: Map<number, Employee>;
  private sales: Map<number, Sale>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private nextProductId = 1;
  private nextClientId = 1;
  private nextEmployeeId = 1;
  private nextSaleId = 1;
  private nextCartItemId = 1;
  private nextOrderId = 1;
  private nextOrderItemId = 1;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.clients = new Map();
    this.employees = new Map();
    this.sales = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "123456"
    });

    // Sample products
    const sampleProducts = [
      { nome: "JBL Boombox 3", categoria: "Caixas de Som", preco: "2499.99", estoque: 15, descricao: "Caixa de som portátil com alta qualidade" },
      { nome: "JBL Tune 720BT", categoria: "Fones de Ouvido", preco: "399.99", estoque: 25, descricao: "Fone Bluetooth com cancelamento de ruído" },
      { nome: "Amvox ACA 1000", categoria: "Amplificadores", preco: "1899.99", estoque: 8, descricao: "Caixa amplificada de alta potência" },
      { nome: "Redragon Zeus Pro", categoria: "Headsets", preco: "299.99", estoque: 12, descricao: "Headset gamer profissional" },
      { nome: "Microfone Shure SM58", categoria: "Microfones", preco: "899.99", estoque: 6, descricao: "Microfone dinâmico profissional" }
    ];

    sampleProducts.forEach(product => this.createProduct(product));

    // Sample clients
    const sampleClients = [
      { nome: "João Silva", email: "joao@email.com", telefone: "(11) 99999-9999", cidade: "São Paulo", status: "Ativo" },
      { nome: "Maria Santos", email: "maria@email.com", telefone: "(11) 88888-8888", cidade: "Rio de Janeiro", status: "Ativo" },
      { nome: "Pedro Costa", email: "pedro@email.com", telefone: "(11) 77777-7777", cidade: "Belo Horizonte", status: "Inativo" },
      { nome: "Ana Oliveira", email: "ana@email.com", telefone: "(11) 66666-6666", cidade: "Curitiba", status: "Ativo" }
    ];

    sampleClients.forEach(client => this.createClient(client));

    // Sample employees
    const sampleEmployees = [
      { nome: "Carlos Manager", cargo: "Gerente", departamento: "Vendas", salario: "5000.00", dataAdmissao: "2020-01-15" },
      { nome: "Lucia Vendedora", cargo: "Vendedora", departamento: "Vendas", salario: "3000.00", dataAdmissao: "2021-03-10" },
      { nome: "Roberto Técnico", cargo: "Técnico", departamento: "Suporte", salario: "3500.00", dataAdmissao: "2019-08-22" },
      { nome: "Sandra Admin", cargo: "Assistente", departamento: "Administrativo", salario: "2800.00", dataAdmissao: "2022-01-05" }
    ];

    sampleEmployees.forEach(employee => this.createEmployee(employee));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.nextProductId++;
    const newProduct: Product = { 
      ...product, 
      id,
      descricao: product.descricao || null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, id };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.nextClientId++;
    const newClient: Client = { ...client, id };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, id };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.nextEmployeeId++;
    const newEmployee: Employee = { ...employee, id };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, id };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Sales methods
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const id = this.nextSaleId++;
    const newSale: Sale = { 
      ...sale, 
      id,
      clienteId: sale.clienteId || null,
      produtoId: sale.produtoId || null,
      dataVenda: sale.dataVenda || null
    };
    this.sales.set(id, newSale);
    return newSale;
  }

  // Cart methods
  async getCartItems(): Promise<CartItem[]> {
    return Array.from(this.cartItems.values());
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Verificar se o produto já está no carrinho
    const existing = Array.from(this.cartItems.values())
      .find(cartItem => cartItem.produtoId === item.produtoId);
    
    if (existing) {
      // Se já existe, aumentar a quantidade
      const updated = { ...existing, quantidade: existing.quantidade + (item.quantidade || 1) };
      this.cartItems.set(existing.id, updated);
      return updated;
    } else {
      // Se não existe, criar novo item
      const id = this.nextCartItemId++;
      const newItem: CartItem = { 
        ...item, 
        id,
        quantidade: item.quantidade || 1,
        createdAt: item.createdAt || null
      };
      this.cartItems.set(id, newItem);
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const existing = this.cartItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, quantidade: quantity };
    this.cartItems.set(id, updated);
    return updated;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(): Promise<boolean> {
    this.cartItems.clear();
    return true;
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.nextOrderId++;
    const newOrder: Order = { 
      ...order, 
      id,
      status: order.status || "pendente",
      clienteId: order.clienteId || null,
      dataVenda: order.dataVenda || null
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  // Order Items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.pedidoId === orderId);
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.nextOrderItemId++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }
}

export const storage = new MemStorage();
