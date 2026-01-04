import { DateRange, ProductFilters, SaleFilters } from '../types';

export const queryKeys = {
  products: (filters?: ProductFilters) => ['products', filters ?? {}] as const,
  product: (id: string) => ['product', id] as const,
  statuses: () => ['statuses'] as const,
  sales: (filters?: SaleFilters) => ['sales', filters ?? {}] as const,
  sale: (id: string) => ['sale', id] as const,
  reports: (type: string, filters?: unknown) => ['reports', type, filters ?? {}] as const,
  dashboard: (period: string, range?: DateRange | null) =>
    ['dashboard', period, range?.start ?? null, range?.end ?? null] as const,
  preferences: () => ['preferences'] as const,
  expenses: (filters?: unknown) => ['expenses', filters ?? {}] as const,
  expenseSummary: (filters?: unknown) => ['expense-summary', filters ?? {}] as const,
};
