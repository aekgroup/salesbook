import { ProductService } from '../supabase/services';
import {
  Product,
  ProductFilters,
  ProductFormValues,
  UUID,
} from '../../shared/types';

export class ProductsRepository {
  async list(filters: ProductFilters = {}): Promise<Product[]> {
    const products = await ProductService.getAll();
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
      filtered = filtered.sort((a: Product, b: Product) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name) * dir;
        }
        return ((a[sortBy] as number) - (b[sortBy] as number)) * dir;
      });
    } else {
      filtered = filtered.sort((a: Product, b: Product) => b.updatedAt.localeCompare(a.updatedAt));
    }

    return filtered;
  }

  async get(id: UUID): Promise<Product | undefined> {
    return await ProductService.getById(id) || undefined;
  }

  async create(input: ProductFormValues): Promise<Product> {
    await this.assertUniqueSku(input.sku);
    const product = {
      sku: input.sku,
      name: input.name,
      category: input.category ?? 'Général',
      brand: input.brand,
      purchasePrice: input.purchasePrice,
      salePrice: input.salePrice,
      quantity: input.quantity ?? 0,
      statusId: input.statusId,
      reorderThreshold: input.reorderThreshold ?? 5,
    };
    return await ProductService.create(product);
  }

  async update(id: UUID, updates: Partial<ProductFormValues>): Promise<Product> {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error('Produit introuvable');
    }
    if (updates.sku && updates.sku !== existing.sku) {
      await this.assertUniqueSku(updates.sku);
    }
    const updateData = {
      sku: updates.sku ?? existing.sku,
      name: updates.name ?? existing.name,
      category: updates.category ?? existing.category,
      brand: updates.brand ?? existing.brand,
      purchasePrice: updates.purchasePrice ?? existing.purchasePrice,
      salePrice: updates.salePrice ?? existing.salePrice,
      quantity: updates.quantity ?? existing.quantity,
      statusId: updates.statusId ?? existing.statusId,
      reorderThreshold: updates.reorderThreshold ?? existing.reorderThreshold,
    };
    return await ProductService.update(id, updateData);
  }

  async remove(id: UUID): Promise<void> {
    await ProductService.delete(id);
  }

  async adjustStock(items: { productId: UUID; delta: number }[]): Promise<void> {
    for (const item of items) {
      const product = await this.get(item.productId);
      if (!product) continue;
      const quantity = product.quantity + item.delta;
      await ProductService.update(item.productId, { quantity });
    }
  }

  async getStockSummary() {
    const products = await this.list();
    const totalCost = products.reduce((acc: number, product: Product) => acc + product.purchasePrice * product.quantity, 0);
    const totalPotential = products.reduce((acc: number, product: Product) => acc + product.salePrice * product.quantity, 0);
    const lowStockCount = products.filter((p: Product) => p.quantity <= p.reorderThreshold).length;
    return {
      totalCost,
      totalPotential,
      lowStockCount,
      totalProducts: products.length,
    };
  }

  private async assertUniqueSku(sku: string) {
    const products = await this.list();
    const existing = products.find((product: Product) => product.sku.toLowerCase() === sku.toLowerCase());
    if (existing) {
      throw new Error(`Le SKU ${sku} est déjà utilisé`);
    }
  }
}
