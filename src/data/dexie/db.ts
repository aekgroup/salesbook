import Dexie, { Table } from 'dexie';
import { differenceInDays, subDays } from 'date-fns';
import {
  Expense,
  PaymentMethodOption,
  Preferences,
  Product,
  Sale,
  SaleItem,
  Status,
} from '../../shared/types';
import { APP_CURRENCY, DEFAULT_PAYMENT_METHODS, DEFAULT_STATUSES } from '../../shared/constants';

export class SalesbookDB extends Dexie {
  products!: Table<Product>;
  statuses!: Table<Status>;
  sales!: Table<Sale>;
  saleItems!: Table<SaleItem>;
  preferences!: Table<Preferences & { id: string; updatedAt: string }>;
  expenses!: Table<Expense>;

  constructor() {
    super('salesbook');
    this.version(1).stores({
      products: '&id, sku, name, category, statusId, updatedAt, quantity',
      statuses: '&id, label, order, isDefault',
      sales: '&id, date, totalRevenue, totalProfit',
      saleItems: '&id, saleId, productId',
      preferences: '&id',
    });

    this.version(2).stores({
      products: '&id, sku, name, category, statusId, updatedAt, quantity',
      statuses: '&id, label, order, isDefault',
      sales: '&id, date, totalRevenue, totalProfit',
      saleItems: '&id, saleId, productId',
      preferences: '&id',
      expenses: '&id, date, category, amount',
    });
  }
}

export const db = new SalesbookDB();

export async function seedInitialData() {
  const statusCount = await db.statuses.count();
  if (statusCount === 0) {
    await db.statuses.bulkAdd(
      DEFAULT_STATUSES.map((status): Status => ({
        id: status.label,
        color: status.color,
        isDefault: status.isDefault,
        label: status.label,
        order: status.order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    );
  }

  const prefsCount = await db.preferences.count();
  if (prefsCount === 0) {
    await db.preferences.add({
      id: 'default',
      currency: APP_CURRENCY,
      paymentMethods: DEFAULT_PAYMENT_METHODS.map((method): PaymentMethodOption => ({ ...method })),
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function ensureSeeded() {
  await db.open();
  await seedInitialData();
}

export interface ExportedData {
  products: Product[];
  statuses: Status[];
  sales: Sale[];
  saleItems: SaleItem[];
  expenses: Expense[];
}

export async function exportAllData(): Promise<ExportedData> {
  await ensureSeeded();
  const [products, statuses, sales, saleItems, expenses] = await Promise.all([
    db.products.toArray(),
    db.statuses.toArray(),
    db.sales.toArray(),
    db.saleItems.toArray(),
    db.expenses.toArray(),
  ]);
  return { products, statuses, sales, saleItems, expenses };
}

export async function importData(payload: ExportedData) {
  await db.transaction(
    'rw',
    [db.products, db.statuses, db.sales, db.saleItems, db.expenses],
    async () => {
      await db.products.clear();
      await db.statuses.clear();
      await db.sales.clear();
      await db.saleItems.clear();
      await db.expenses.clear();

      await db.statuses.bulkAdd(payload.statuses);
      await db.products.bulkAdd(payload.products);
      await db.sales.bulkAdd(payload.sales);
      await db.saleItems.bulkAdd(payload.saleItems);
      await db.expenses.bulkAdd(payload.expenses);
    },
  );
}

export async function getRecentPerformance(days = 30) {
  await ensureSeeded();
  const now = new Date();
  const start = subDays(now, days);
  const sales = await db.sales.where('date').above(start.toISOString()).toArray();
  const grouped = sales.reduce(
    (acc, sale) => {
      const diff = differenceInDays(new Date(sale.date), start);
      acc.labels.push(diff.toString());
      acc.data.push(sale.totalProfit);
      return acc;
    },
    { labels: [] as string[], data: [] as number[] },
  );
  return grouped;
}
