import { ProductsRepository } from './productsRepository';
import { SalesRepository } from './salesRepository';
import { StatusesRepository } from './statusesRepository';
import { PreferencesRepository } from './preferencesRepository';
import { DateRange, PaymentMethod, PaymentMethodOption, Product, Sale } from '../../shared/types';
import { calcSaleTotals, calcStockValue } from '../../shared/utils/format';
import { ensureSeeded } from '../dexie/db';
import { subDays } from 'date-fns';
import { DEFAULT_PAYMENT_METHODS } from '../../shared/constants';

type StockSnapshot = Awaited<ReturnType<ProductsRepository['getStockSummary']>>;

export interface DashboardTrendPoint {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface DashboardPaymentStat {
  method: PaymentMethod | 'other';
  label: string;
  salesCount: number;
  revenue: number;
  share: number;
  [key: string]: string | number | undefined;
}

export interface DashboardStats {
  totals: ReturnType<typeof calcSaleTotals>;
  topProducts: Awaited<ReturnType<SalesRepository['getTopProducts']>>;
  stock: StockSnapshot;
  period: DateRange;
  salesCount: number;
  avgOrderValue: number;
  trend: DashboardTrendPoint[];
  paymentOverview: DashboardPaymentStat[];
  recentSales: Sale[];
}

interface StockReport {
  snapshotDate: string;
  totalCost: number;
  totalPotential: number;
  lowStock: Product[];
  products: Product[];
}

interface SalesReport {
  range: DateRange;
  sales: Sale[];
  totals: ReturnType<typeof calcSaleTotals>;
}

export class ReportsRepository {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly salesRepository: SalesRepository,
    private readonly statusesRepository: StatusesRepository,
    private readonly preferencesRepository: PreferencesRepository,
  ) {}

  async getDashboardStats(range: 'day' | 'week' | 'month' | 'custom', customRange?: DateRange): Promise<DashboardStats> {
    await ensureSeeded();
    const now = new Date();
    let start: Date;
    switch (range) {
      case 'day':
        start = subDays(now, 1);
        break;
      case 'week':
        start = subDays(now, 7);
        break;
      case 'month':
        start = subDays(now, 30);
        break;
      case 'custom':
        if (!customRange) throw new Error('Custom range requis');
        start = new Date(customRange.start);
        break;
      default:
        start = subDays(now, 7);
    }

    const end = range === 'custom' && customRange ? new Date(customRange.end) : now;
    const rangeFilter = { start: start.toISOString(), end: end.toISOString() };
    const sales = await this.salesRepository.list({ range: rangeFilter });
    const totals = calcSaleTotals(sales.flatMap((sale) => sale.items));
    const topProducts = await this.salesRepository.getTopProducts(5);
    const stock = await this.productsRepository.getStockSummary();
    const preferences = await this.preferencesRepository.get();
    const paymentOptions: PaymentMethodOption[] =
      preferences.paymentMethods.length > 0
        ? preferences.paymentMethods
        : DEFAULT_PAYMENT_METHODS.map((method) => ({ ...method }));

    const trendMap = new Map<string, { revenue: number; cost: number }>();
    const paymentMap = new Map<string, { revenue: number; count: number }>();

    for (const sale of sales) {
      const dayKey = sale.date.slice(0, 10);
      const existingDay = trendMap.get(dayKey) ?? { revenue: 0, cost: 0 };
      trendMap.set(dayKey, {
        revenue: existingDay.revenue + sale.totalRevenue,
        cost: existingDay.cost + sale.totalCost,
      });

      const methodKey = sale.paymentMethod ?? 'other';
      const existingMethod = paymentMap.get(methodKey) ?? { revenue: 0, count: 0 };
      paymentMap.set(methodKey, {
        revenue: existingMethod.revenue + sale.totalRevenue,
        count: existingMethod.count + 1,
      });
    }

    const trend = Array.from(trendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({
        date,
        revenue: value.revenue,
        cost: value.cost,
        profit: value.revenue - value.cost,
      }));

    const knownPaymentStats = paymentOptions.map(({ value, label }) => {
      const stats = paymentMap.get(value) ?? { revenue: 0, count: 0 };
      paymentMap.delete(value);
      return { method: value, label, revenue: stats.revenue, salesCount: stats.count };
    });

    const remainingPaymentStats = Array.from(paymentMap.entries()).map(([method, stats]) => ({
      method: (method as PaymentMethod) ?? 'other',
      label: method ? method : 'Autres',
      revenue: stats.revenue,
      salesCount: stats.count,
    }));

    const paymentTotals = [...knownPaymentStats, ...remainingPaymentStats];
    const totalPaymentRevenue = paymentTotals.reduce((acc, stat) => acc + stat.revenue, 0);

    const paymentOverview: DashboardPaymentStat[] = paymentTotals.map((stat) => ({
      ...stat,
      share: totalPaymentRevenue === 0 ? 0 : (stat.revenue / totalPaymentRevenue) * 100,
    }));

    const avgOrderValue = sales.length === 0 ? 0 : totals.totalRevenue / sales.length;

    const recentSales = sales.slice(0, 5);

    return {
      totals,
      topProducts,
      stock,
      period: rangeFilter,
      salesCount: sales.length,
      avgOrderValue,
      trend,
      paymentOverview,
      recentSales,
    };
  }

  async getStockReport(): Promise<StockReport> {
    await ensureSeeded();
    const products = await this.productsRepository.list();
    const { totalCost, potentialRevenue, lowStock } = calcStockValue(products);
    return {
      snapshotDate: new Date().toISOString(),
      totalCost,
      totalPotential: potentialRevenue,
      lowStock,
      products,
    };
  }

  async getSalesReport(range: DateRange): Promise<SalesReport> {
    const sales = await this.salesRepository.list({ range });
    const totals = calcSaleTotals(sales.flatMap((sale) => sale.items));
    return { range, sales, totals };
  }
}
