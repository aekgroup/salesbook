import { ProductService } from '../supabase/services';
import { Product, ProductFilters, ProductFormValues, UUID } from '../../shared/types';

/**
 * Repository = logique métier côté app (filtrage/tri/validation),
 * Service = accès DB (Supabase).
 *
 * IMPORTANT :
 * - ProductService gère déjà user_id (via UserService en interne).
 * - Le repository ne doit plus injecter user_id ni dépendre de UserService.
 */
export class ProductsRepository {
  async list(filters: ProductFilters = {}): Promise<Product[]> {
    const products = await ProductService.getAll();
    const search = filters.search?.toLowerCase();

    let filtered = products.filter((product) => {
      if (search) {
        const text = `${product.name} ${product.sku} ${product.category}`.toLowerCase();
        if (!text.includes(search)) return false;
      }
      if (filters.statusId && product.statusId !== filters.statusId) return false;
      if (filters.category && product.category !== filters.category) return false;
      if (filters.lowStockOnly && product.quantity > product.reorderThreshold) return false;
      return true;
    });

    if (filters.sortBy) {
      const { sortBy, sortDir = 'asc' } = filters;
      const dir = sortDir === 'asc' ? 1 : -1;

      filtered = filtered.sort((a: Product, b: Product) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;

        // sortBy est censé être un champ numérique (purchasePrice, salePrice, quantity, etc.)
        const av = a[sortBy] as unknown as number;
        const bv = b[sortBy] as unknown as number;
        return (av - bv) * dir;
      });
    } else {
      filtered = filtered.sort((a: Product, b: Product) => b.updatedAt.localeCompare(a.updatedAt));
    }

    return filtered;
  }

  async get(id: UUID): Promise<Product | undefined> {
    const p = await ProductService.getById(id);
    return p ?? undefined;
  }

  async create(input: ProductFormValues): Promise<Product> {
    // On garde la validation côté app
    await this.assertUniqueSku(input.sku);

    // IMPORTANT: ne plus envoyer user_id (le service s’en charge)
    const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
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
    if (!existing) throw new Error('Produit introuvable');

    if (updates.sku && updates.sku !== existing.sku) {
      await this.assertUniqueSku(updates.sku, id);
    }

    const updateData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> = {
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
    // Version simple : séquentielle (OK pour petit volume)
    for (const item of items) {
      const product = await this.get(item.productId);
      if (!product) continue;

      const quantity = product.quantity + item.delta;
      await ProductService.update(item.productId, { quantity });
    }
  }

  async getStockSummary(): Promise<{
    totalCost: number;
    totalPotential: number;
    lowStockCount: number;
    totalProducts: number;
  }> {
    const products = await this.list();
    const totalCost = products.reduce((acc, p) => acc + p.purchasePrice * p.quantity, 0);
    const totalPotential = products.reduce((acc, p) => acc + p.salePrice * p.quantity, 0);
    const lowStockCount = products.filter((p) => p.quantity <= p.reorderThreshold).length;

    return {
      totalCost,
      totalPotential,
      lowStockCount,
      totalProducts: products.length,
    };
  }

  /**
   * Validation SKU unique côté app.
   * Optionnel: excludeId permet d'ignorer le produit en cours de modification.
   */
  private async assertUniqueSku(sku: string, excludeId?: UUID) {
    const products = await ProductService.getAll();

    const existing = products.find((p) => {
      if (excludeId && p.id === excludeId) return false;
      return p.sku.toLowerCase() === sku.toLowerCase();
    });

    if (existing) {
      throw new Error(`Le SKU ${sku} est déjà utilisé`);
    }
  }
}
