import { z } from 'zod';

export type UUID = string;

export interface Status {
  id: UUID;
  label: string;
  color: string; // tailwind-compatible hex/hsl string
  isDefault: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: UUID;
  sku: string;
  name: string;
  category: string;
  brand?: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  statusId: UUID;
  reorderThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = string;

export interface PaymentMethodOption {
  value: string;
  label: string;
}

export interface SaleItem {
  id: UUID;
  saleId: UUID;
  productId: UUID;
  qty: number;
  unitSalePrice: number;
  unitCostPrice: number;
  profitLine: number;
}

export interface Sale {
  id: UUID;
  date: string;
  items: SaleItem[];
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  paymentMethod?: PaymentMethod;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  statusId?: UUID;
  category?: string;
  lowStockOnly?: boolean;
  sortBy?: 'name' | 'salePrice' | 'quantity' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
}

export interface DateRange {
  start: string;
  end: string;
}

export interface SaleFilters {
  range?: DateRange;
  paymentMethod?: PaymentMethod;
  search?: string; // search note or product name
}

export interface ReportFilters {
  range?: DateRange;
  type: 'sales' | 'stock';
}

export type EntityWithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export const productSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(2, 'SKU requis'),
  name: z.string().min(2, 'Nom requis'),
  category: z.string().min(1, 'Catégorie requise').default('Général'),
  brand: z.string().optional(),
  purchasePrice: z.number().min(0, 'Coût invalide'),
  salePrice: z.number().min(0, 'Prix invalide'),
  quantity: z.number().min(0).default(0),
  statusId: z.string().min(1, 'Statut requis'),
  reorderThreshold: z.number().min(0).default(5),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const statusSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(2),
  color: z.string().min(4),
  isDefault: z.boolean().default(false),
  order: z.number().min(0).default(0),
});

export type StatusFormValues = z.infer<typeof statusSchema>;

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().min(1),
  unitSalePrice: z.number().min(0),
  unitCostPrice: z.number().min(0),
  allowNegativeStock: z.boolean().optional().default(false),
});

export const saleSchema = z.object({
  id: z.string().optional(),
  date: z.string().optional(),
  paymentMethod: z.string().min(1, 'Méthode requise').optional(),
  note: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'Ajouter au moins 1 produit'),
});

export type SaleFormValues = z.infer<typeof saleSchema>;

export interface Preferences {
  currency: string;
  paymentMethods: PaymentMethodOption[];
}

export interface Expense {
  id: UUID;
  label: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  search?: string;
  category?: string;
  range?: Partial<DateRange>;
}

export const expenseSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(2, 'Nom requis'),
  category: z.string().min(1, 'Catégorie requise'),
  amount: z.number().min(0.01, 'Montant invalide'),
  date: z.string().min(1, 'Date requise'),
  note: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
