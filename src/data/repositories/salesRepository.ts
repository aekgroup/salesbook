import { nanoid } from 'nanoid';
import { db, ensureSeeded } from '../dexie/db';
import { ProductsRepository } from './productsRepository';
import { Product, Sale, SaleFilters, SaleFormValues, SaleItem, SaleItem as SaleItemModel } from '../../shared/types';
import { calcSaleTotals } from '../../shared/utils/format';

export class SalesRepository {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async list(filters: SaleFilters = {}): Promise<Sale[]> {
    await ensureSeeded();
    let sales = await db.sales.toArray();

    if (filters.range) {
      const { start, end } = filters.range;
      sales = sales.filter((sale) => sale.date >= start && sale.date <= end);
    }

    if (filters.paymentMethod) {
      sales = sales.filter((sale) => sale.paymentMethod === filters.paymentMethod);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      sales = sales.filter((sale) => sale.note?.toLowerCase().includes(term));
    }

    const saleIds = sales.map((sale) => sale.id);
    const items = await db.saleItems.where('saleId').anyOf(saleIds).toArray();

    return sales
      .map((sale) => ({
        ...sale,
        items: items.filter((item) => item.saleId === sale.id),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async get(id: string): Promise<Sale | undefined> {
    const sale = await db.sales.get(id);
    if (!sale) return undefined;
    const items = await db.saleItems.where('saleId').equals(id).toArray();
    return { ...sale, items };
  }

  async create(input: SaleFormValues): Promise<Sale> {
    await ensureSeeded();
    const now = new Date().toISOString();
    const saleId = input.id ?? nanoid();

    const items: SaleItemModel[] = input.items.map((item) => ({
      id: nanoid(),
      saleId,
      productId: item.productId,
      qty: item.qty,
      unitSalePrice: item.unitSalePrice,
      unitCostPrice: item.unitCostPrice,
      profitLine: (item.unitSalePrice - item.unitCostPrice) * item.qty,
    }));

    const { totalRevenue, totalCost, totalProfit } = calcSaleTotals(items);

    const sale: Sale = {
      id: saleId,
      date: input.date ?? now,
      paymentMethod: input.paymentMethod,
      note: input.note,
      items,
      totalRevenue,
      totalCost,
      totalProfit,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction('rw', db.sales, db.saleItems, db.products, async () => {
      await db.sales.add({ ...sale, items: undefined as unknown as SaleItem[] });
      await db.saleItems.bulkAdd(items);
      await this.productsRepository.adjustStock(
        items.map((item) => ({ productId: item.productId, delta: -item.qty })),
      );
    });

    return sale;
  }

  async remove(id: string, restoreStock = true) {
    const sale = await this.get(id);
    if (!sale) return;

    await db.transaction('rw', db.sales, db.saleItems, db.products, async () => {
      await db.saleItems.where('saleId').equals(id).delete();
      await db.sales.delete(id);

      if (restoreStock) {
        await this.productsRepository.adjustStock(
          sale.items.map((item) => ({ productId: item.productId, delta: item.qty })),
        );
      }
    });
  }

  async update(id: string, input: SaleFormValues) {
    await this.remove(id, true);
    return this.create({ ...input, id });
  }

  async getTopProducts(limit = 5) {
    const items = await db.saleItems.toArray();
    const productMap = new Map<string, { qty: number; profit: number }>();
    for (const item of items) {
      const existing = productMap.get(item.productId) ?? { qty: 0, profit: 0 };
      productMap.set(item.productId, {
        qty: existing.qty + item.qty,
        profit: existing.profit + item.profitLine,
      });
    }

    const enriched = await Promise.all(
      Array.from(productMap.entries()).map(async ([productId, stats]) => {
        const product = await db.products.get(productId as keyof Product);
        return {
          productId,
          name: product?.name ?? 'Produit supprimé',
          ...stats,
        };
      }),
    );

    return enriched
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);
  }
}
