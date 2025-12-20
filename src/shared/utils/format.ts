import { format, parseISO } from 'date-fns';
import { Product, Sale } from '../types';
import { APP_CURRENCY, APP_LOCALE } from '../constants';
import { getActiveCurrency } from '../state/currencyStore';
import Papa from 'papaparse';

export const formatCurrency = (value: number, locale = APP_LOCALE, currency = getActiveCurrency()) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: currency ?? APP_CURRENCY }).format(value);

export const formatNumber = (value: number, locale = APP_LOCALE) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);

export const formatDate = (value: string | Date, pattern = 'dd MMM yyyy') =>
  format(typeof value === 'string' ? parseISO(value) : value, pattern);

export const calcStockValue = (products: Product[]) => {
  const totalCost = products.reduce((acc, product) => acc + product.quantity * product.purchasePrice, 0);
  const potentialRevenue = products.reduce((acc, product) => acc + product.quantity * product.salePrice, 0);
  const lowStock = products.filter((product) => product.quantity <= product.reorderThreshold);
  return { totalCost, potentialRevenue, lowStock };
};

export const calcSaleTotals = (items: Sale['items']) => {
  const totalRevenue = items.reduce((acc, item) => acc + item.qty * item.unitSalePrice, 0);
  const totalCost = items.reduce((acc, item) => acc + item.qty * item.unitCostPrice, 0);
  const totalProfit = totalRevenue - totalCost;
  const margin = totalRevenue === 0 ? 0 : (totalProfit / totalRevenue) * 100;
  return { totalRevenue, totalCost, totalProfit, margin };
};

export const exportToCsv = <T extends object>(rows: T[], fileName: string) => {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${fileName}.csv`);
};

export const exportToJson = (data: unknown, fileName: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `${fileName}.json`);
};

const triggerDownload = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
