import { supabase } from './client';
import { 
  ProductRow, 
  ProductInsert, 
  ProductUpdate,
  StatusRow,
  StatusInsert,
  StatusUpdate,
  SaleRow,
  SaleInsert,
  SaleUpdate,
  SaleItemRow,
  SaleItemInsert,
  SaleItemUpdate,
  PreferencesRow,
  PreferencesInsert,
  PreferencesUpdate
} from './types';
import { Product, Status, Sale, SaleItem, Preferences, PaymentMethodOption } from '../../shared/types';

// Helper functions to convert between Supabase and app formats
export const supabaseToProduct = (row: ProductRow): Product => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  category: row.category,
  brand: row.brand,
  purchasePrice: row.purchase_price,
  salePrice: row.sale_price,
  quantity: row.quantity,
  statusId: row.status_id,
  reorderThreshold: row.reorder_threshold,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const productToSupabase = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): ProductInsert => ({
  sku: product.sku,
  name: product.name,
  category: product.category,
  brand: product.brand,
  purchase_price: product.purchasePrice,
  sale_price: product.salePrice,
  quantity: product.quantity,
  status_id: product.statusId,
  reorder_threshold: product.reorderThreshold,
});

export const supabaseToStatus = (row: StatusRow): Status => ({
  id: row.id,
  label: row.label,
  color: row.color,
  isDefault: row.is_default,
  order: row.order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const statusToSupabase = (status: Omit<Status, 'id' | 'createdAt' | 'updatedAt'>): StatusInsert => ({
  label: status.label,
  color: status.color,
  is_default: status.isDefault,
  order: status.order,
});

export const supabaseToSale = (row: SaleRow, items: SaleItem[]): Sale => ({
  id: row.id,
  date: row.date,
  items,
  totalRevenue: row.total_revenue,
  totalCost: row.total_cost,
  totalProfit: row.total_profit,
  paymentMethod: row.payment_method,
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const saleToSupabase = (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'items'>): SaleInsert => ({
  date: sale.date,
  total_revenue: sale.totalRevenue,
  total_cost: sale.totalCost,
  total_profit: sale.totalProfit,
  payment_method: sale.paymentMethod,
  note: sale.note,
});

export const supabaseToSaleItem = (row: SaleItemRow): SaleItem => ({
  id: row.id,
  saleId: row.sale_id,
  productId: row.product_id,
  qty: row.qty,
  unitSalePrice: row.unit_sale_price,
  unitCostPrice: row.unit_cost_price,
  profitLine: row.profit_line,
});

export const saleItemToSupabase = (item: Omit<SaleItem, 'id'>): SaleItemInsert => ({
  sale_id: item.saleId,
  product_id: item.productId,
  qty: item.qty,
  unit_sale_price: item.unitSalePrice,
  unit_cost_price: item.unitCostPrice,
  profit_line: item.profitLine,
});

export const supabaseToPreferences = (row: PreferencesRow): Preferences => ({
  currency: row.currency,
  paymentMethods: JSON.parse(row.payment_methods) as PaymentMethodOption[],
});

export const preferencesToSupabase = (prefs: Preferences): PreferencesInsert => ({
  currency: prefs.currency,
  payment_methods: JSON.stringify(prefs.paymentMethods),
});

// Service classes for database operations
export class ProductService {
  static async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(supabaseToProduct);
  }

  static async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return supabaseToProduct(data);
  }

  static async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(productToSupabase(product))
      .select()
      .single();

    if (error) throw error;
    return supabaseToProduct(data);
  }

  static async update(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    const supabaseUpdates: ProductUpdate = {};
    
    if (updates.sku !== undefined) supabaseUpdates.sku = updates.sku;
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.category !== undefined) supabaseUpdates.category = updates.category;
    if (updates.brand !== undefined) supabaseUpdates.brand = updates.brand;
    if (updates.purchasePrice !== undefined) supabaseUpdates.purchase_price = updates.purchasePrice;
    if (updates.salePrice !== undefined) supabaseUpdates.sale_price = updates.salePrice;
    if (updates.quantity !== undefined) supabaseUpdates.quantity = updates.quantity;
    if (updates.statusId !== undefined) supabaseUpdates.status_id = updates.statusId;
    if (updates.reorderThreshold !== undefined) supabaseUpdates.reorder_threshold = updates.reorderThreshold;

    const { data, error } = await supabase
      .from('products')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return supabaseToProduct(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export class StatusService {
  static async getAll(): Promise<Status[]> {
    const { data, error } = await supabase
      .from('statuses')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data.map(supabaseToStatus);
  }

  static async create(status: Omit<Status, 'id' | 'createdAt' | 'updatedAt'>): Promise<Status> {
    const { data, error } = await supabase
      .from('statuses')
      .insert(statusToSupabase(status))
      .select()
      .single();

    if (error) throw error;
    return supabaseToStatus(data);
  }

  static async update(id: string, updates: Partial<Omit<Status, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Status> {
    const supabaseUpdates: StatusUpdate = {};
    
    if (updates.label !== undefined) supabaseUpdates.label = updates.label;
    if (updates.color !== undefined) supabaseUpdates.color = updates.color;
    if (updates.isDefault !== undefined) supabaseUpdates.is_default = updates.isDefault;
    if (updates.order !== undefined) supabaseUpdates.order = updates.order;

    const { data, error } = await supabase
      .from('statuses')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return supabaseToStatus(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('statuses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export class SaleService {
  static async getAll(): Promise<Sale[]> {
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // Get all sale items for these sales
    const saleIds = sales.map(s => s.id);
    const { data: items } = await supabase
      .from('sale_items')
      .select('*')
      .in('sale_id', saleIds);

    if (!items) throw new Error('Failed to fetch sale items');

    // Group items by sale
    const itemsBySale = items.reduce((acc, item) => {
      if (!acc[item.sale_id]) acc[item.sale_id] = [];
      acc[item.sale_id].push(supabaseToSaleItem(item));
      return acc;
    }, {} as Record<string, SaleItem[]>);

    return sales.map(sale => supabaseToSale(sale, itemsBySale[sale.id] || []));
  }

  static async create(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> {
    // Start a transaction
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert(saleToSupabase(sale))
      .select()
      .single();

    if (saleError) throw saleError;

    // Insert sale items
    const itemsToInsert = sale.items.map(item => saleItemToSupabase({
      ...item,
      saleId: saleData.id
    }));

    const { data: itemsData, error: itemsError } = await supabase
      .from('sale_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) throw itemsError;

    return supabaseToSale(saleData, itemsData.map(supabaseToSaleItem));
  }

  static async delete(id: string): Promise<void> {
    // Delete sale items first (foreign key constraint)
    await supabase
      .from('sale_items')
      .delete()
      .eq('sale_id', id);

    // Then delete the sale
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export class PreferencesService {
  static async get(): Promise<Preferences | null> {
    const { data, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    if (!data) return null;

    return supabaseToPreferences(data);
  }

  static async update(preferences: Preferences): Promise<Preferences> {
    const { data, error } = await supabase
      .from('preferences')
      .upsert({
        id: 'default',
        ...preferencesToSupabase(preferences),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return supabaseToPreferences(data);
  }
}
