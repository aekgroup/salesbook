import Dexie, { Table } from 'dexie';
import { nanoid } from 'nanoid';
import { differenceInDays, subDays } from 'date-fns';
import { Preferences, Product, Sale, SaleItem, Status } from '../../shared/types';
import { APP_CURRENCY, DEFAULT_PAYMENT_METHODS, DEFAULT_STATUSES } from '../../shared/constants';

export class SalesbookDB extends Dexie {
  products!: Table<Product>;
  statuses!: Table<Status>;
  sales!: Table<Sale>;
  saleItems!: Table<SaleItem>;
  preferences!: Table<Preferences & { id: string; updatedAt: string }>;

  constructor() {
    super('salesbook');
    this.version(1).stores({
      products: '&id, sku, name, category, statusId, updatedAt, quantity',
      statuses: '&id, label, order, isDefault',
      sales: '&id, date, totalRevenue, totalProfit',
      saleItems: '&id, saleId, productId',
      preferences: '&id',
    });
  }
}

export const db = new SalesbookDB();

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const demoProducts = () => {
  const now = new Date();
  const statuses = DEFAULT_STATUSES;
  return Array.from({ length: 12 }).map((_, idx) => {
    const purchasePrice = random(5, 70);
    const salePrice = purchasePrice + random(5, 40);
    const created = subDays(now, random(1, 30));
    return {
      id: nanoid(),
      sku: `SKU-${1000 + idx}`,
      name: `Produit ${idx + 1}`,
      category: idx % 2 === 0 ? 'Électronique' : 'Accessoires',
      brand: idx % 2 === 0 ? 'Aek' : 'Générique',
      purchasePrice,
      salePrice,
      quantity: random(0, 60),
      statusId: statuses[idx % statuses.length].label,
      reorderThreshold: 10,
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    } satisfies Product;
  });
};

export async function seedInitialData() {
  const statusCount = await db.statuses.count();
  if (statusCount === 0) {
    await db.statuses.bulkAdd(
      DEFAULT_STATUSES.map((status) => ({
        id: status.label,
        ...status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    );
  }

  const productCount = await db.products.count();
  if (productCount === 0) {
    await db.products.bulkAdd(demoProducts());
  }

  const prefsCount = await db.preferences.count();
  if (prefsCount === 0) {
    await db.preferences.add({
      id: 'default',
      currency: APP_CURRENCY,
      paymentMethods: DEFAULT_PAYMENT_METHODS.map((method) => ({ ...method })),
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
}

export async function exportAllData(): Promise<ExportedData> {
  await ensureSeeded();
  const [products, statuses, sales, saleItems] = await Promise.all([
    db.products.toArray(),
    db.statuses.toArray(),
    db.sales.toArray(),
    db.saleItems.toArray(),
  ]);
  return { products, statuses, sales, saleItems };
}

export async function importData(payload: ExportedData) {
  await db.transaction('rw', db.products, db.statuses, db.sales, db.saleItems, async () => {
    await db.products.clear();
    await db.statuses.clear();
    await db.sales.clear();
    await db.saleItems.clear();

    await db.statuses.bulkAdd(payload.statuses);
    await db.products.bulkAdd(payload.products);
    await db.sales.bulkAdd(payload.sales);
    await db.saleItems.bulkAdd(payload.saleItems);
  });
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
