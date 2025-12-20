import { nanoid } from 'nanoid';
import { db, ensureSeeded } from '../dexie/db';
import {
  Product,
  ProductFilters,
  ProductFormValues,
  UUID,
} from '../../shared/types';

export class ProductsRepository {
  async list(filters: ProductFilters = {}): Promise<Product[]> {
    await ensureSeeded();
    const products = await db.products.toArray();
    const search = filters.search?.toLowerCase();

    let filtered = products.filter((product) => {
      if (search) {
        const text = `${product.name} ${product.sku} ${product.category}`.toLowerCase();
        if (!text.includes(search)) return false;
      }
      if (filters.statusId && product.statusId !== filters.statusId) {
        return false;
      }
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.lowStockOnly && product.quantity > product.reorderThreshold) {
        return false;
      }
      return true;
    });

    if (filters.sortBy) {
      const { sortBy, sortDir = 'asc' } = filters;
      filtered = filtered.sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name) * dir;
        }
        return ((a[sortBy] as number) - (b[sortBy] as number)) * dir;
      });
    } else {
      filtered = filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    return filtered;
  }

  async get(id: UUID): Promise<Product | undefined> {
    await ensureSeeded();
    return db.products.get(id);
  }

  async create(input: ProductFormValues): Promise<Product> {
    await ensureSeeded();
    await this.assertUniqueSku(input.sku);
    const now = new Date().toISOString();
    const product: Product = {
      id: input.id ?? nanoid(),
      sku: input.sku,
      name: input.name,
      category: input.category ?? 'Général',
      brand: input.brand,
      purchasePrice: input.purchasePrice,
      salePrice: input.salePrice,
      quantity: input.quantity ?? 0,
      statusId: input.statusId,
      reorderThreshold: input.reorderThreshold ?? 5,
      createdAt: now,
      updatedAt: now,
    };
    await db.products.add(product);
    return product;
  }

  async update(id: UUID, updates: Partial<ProductFormValues>): Promise<Product> {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error('Produit introuvable');
    }
    if (updates.sku && updates.sku !== existing.sku) {
      await this.assertUniqueSku(updates.sku);
    }
    const now = new Date().toISOString();
    const updated: Product = {
      ...existing,
      ...updates,
      sku: updates.sku ?? existing.sku,
      updatedAt: now,
    };
    await db.products.put(updated);
    return updated;
  }

  async remove(id: UUID): Promise<void> {
    await db.products.delete(id);
  }

  async adjustStock(items: { productId: UUID; delta: number }[]): Promise<void> {
    for (const item of items) {
      const product = await db.products.get(item.productId);
      if (!product) continue;
      const quantity = product.quantity + item.delta;
      await db.products.update(item.productId, {
        quantity,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async getStockSummary() {
    await ensureSeeded();
    const products = await db.products.toArray();
    const totalCost = products.reduce((acc, product) => acc + product.purchasePrice * product.quantity, 0);
    const totalPotential = products.reduce((acc, product) => acc + product.salePrice * product.quantity, 0);
    const lowStockCount = products.filter((p) => p.quantity <= p.reorderThreshold).length;
    return {
      totalCost,
      totalPotential,
      lowStockCount,
      totalProducts: products.length,
    };
  }

  private async assertUniqueSku(sku: string) {
    const existing = await db.products.where('sku').equalsIgnoreCase(sku).first();
    if (existing) {
      throw new Error(`Le SKU ${sku} est déjà utilisé`);
    }
  }
}
