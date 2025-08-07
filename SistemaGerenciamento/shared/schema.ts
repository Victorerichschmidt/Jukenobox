import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: integer("id").primaryKey(),
  nome: text("nome").notNull(),
  categoria: text("categoria").notNull(),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  estoque: integer("estoque").notNull(),
  descricao: text("descricao"),
});

export const clients = pgTable("clients", {
  id: integer("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  telefone: text("telefone").notNull(),
  cidade: text("cidade").notNull(),
  status: text("status").notNull(),
});

export const employees = pgTable("employees", {
  id: integer("id").primaryKey(),
  nome: text("nome").notNull(),
  cargo: text("cargo").notNull(),
  departamento: text("departamento").notNull(),
  salario: decimal("salario", { precision: 10, scale: 2 }).notNull(),
  dataAdmissao: date("data_admissao").notNull(),
});

export const sales = pgTable("sales", {
  id: integer("id").primaryKey(),
  clienteId: integer("cliente_id").references(() => clients.id),
  produtoId: integer("produto_id").references(() => products.id),
  quantidade: integer("quantidade").notNull(),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  dataVenda: timestamp("data_venda").defaultNow(),
});

// Nova tabela para itens do carrinho
export const cartItems = pgTable("cart_items", {
  id: integer("id").primaryKey(),
  produtoId: integer("produto_id").references(() => products.id).notNull(),
  quantidade: integer("quantidade").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nova tabela para pedidos completos
export const orders = pgTable("orders", {
  id: integer("id").primaryKey(),
  clienteId: integer("cliente_id").references(() => clients.id),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pendente"), // pendente, concluido, cancelado
  dataVenda: timestamp("data_venda").defaultNow(),
  observacoes: text("observacoes"),
});

// Tabela para itens de cada pedido
export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey(),
  pedidoId: integer("pedido_id").references(() => orders.id).notNull(),
  produtoId: integer("produto_id").references(() => products.id).notNull(),
  quantidade: integer("quantidade").notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
