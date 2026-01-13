import { nanoid } from 'nanoid';
import { SaleService } from '../supabase/services';
import { ProductsRepository } from './productsRepository';
import { Sale, SaleFilters, SaleFormValues, SaleItem, SaleItem as SaleItemModel } from '../../shared/types';
import { calcSaleTotals } from '../../shared/utils/format';

export class SalesRepository {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async list(filters: SaleFilters = {}): Promise<Sale[]> {
    let sales = await SaleService.getAll();

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

    return sales.sort((a, b) => b.date.localeCompare(a.date));
  }

  async get(id: string): Promise<Sale | undefined> {
    const sales = await this.list();
    return sales.find((sale) => sale.id === id);
  }

  async create(input: SaleFormValues): Promise<Sale> {
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

    const sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'> = {
      date: input.date ?? now,
      paymentMethod: input.paymentMethod,
      note: input.note,
      items,
      totalRevenue,
      totalCost,
      totalProfit,
    };

    // Create sale and adjust stock
    const createdSale = await SaleService.create(sale);
    
    // Adjust product stock
    await this.productsRepository.adjustStock(
      items.map((item) => ({ productId: item.productId, delta: -item.qty })),
    );

    return createdSale;
  }

  async remove(id: string, restoreStock = true) {
    const sale = await this.get(id);
    if (!sale) return;

    // Delete sale from Supabase
    await SaleService.delete(id);

    // Restore stock if requested
    if (restoreStock) {
      await this.productsRepository.adjustStock(
        sale.items.map((item) => ({ productId: item.productId, delta: item.qty })),
      );
    }
  }

  async update(id: string, input: SaleFormValues) {
    await this.remove(id, true);
    return this.create({ ...input, id });
  }

  async getTopProducts(limit = 5) {
    const sales = await this.list();
    const allItems = sales.flatMap((sale) => sale.items);
    const productMap = new Map<string, { qty: number; profit: number }>();
    
    for (const item of allItems) {
      const existing = productMap.get(item.productId) ?? { qty: 0, profit: 0 };
      productMap.set(item.productId, {
        qty: existing.qty + item.qty,
        profit: existing.profit + item.profitLine,
      });
    }

    const enriched = await Promise.all(
      Array.from(productMap.entries()).map(async ([productId, stats]) => {
        const product = await this.productsRepository.get(productId);
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
