import { createContext, useContext } from 'react';
import { ProductsRepository } from './repositories/productsRepository';
import { StatusesRepository } from './repositories/statusesRepository';
import { SalesRepository } from './repositories/salesRepository';
import { ReportsRepository } from './repositories/reportsRepository';
import { PreferencesRepository } from './repositories/preferencesRepository';

export interface DataProvider {
  products: ProductsRepository;
  statuses: StatusesRepository;
  sales: SalesRepository;
  reports: ReportsRepository;
  preferences: PreferencesRepository;
}

export class DexieDataProvider implements DataProvider {
  products: ProductsRepository;
  statuses: StatusesRepository;
  sales: SalesRepository;
  reports: ReportsRepository;
  preferences: PreferencesRepository;

  constructor() {
    this.products = new ProductsRepository();
    this.statuses = new StatusesRepository();
    this.preferences = new PreferencesRepository();
    this.sales = new SalesRepository(this.products);
    this.reports = new ReportsRepository(this.products, this.sales, this.statuses, this.preferences);
  }
}

const DataProviderContext = createContext<DataProvider | null>(null);

export const DataProviderProvider = DataProviderContext.Provider;

export const useDataProvider = () => {
  const ctx = useContext(DataProviderContext);
  if (!ctx) {
    throw new Error('useDataProvider must be used within DataProviderProvider');
  }
  return ctx;
};
