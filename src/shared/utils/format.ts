import { format, parseISO } from 'date-fns';
import { Product, Sale } from '../types';
import { APP_CURRENCY, APP_LOCALE } from '../constants';
import { getActiveCurrency } from '../state/currencyStore';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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

const sanitizeFileName = (name: string) =>
  name
    .replace(/[:]/g, '-')           // évite ":" (ISO string)
    .replace(/[\\/?"<>|*]/g, '-')   // chars invalides Windows/Android providers
    .replace(/\s+/g, '_');

const toBase64Utf8 = (text: string) => btoa(unescape(encodeURIComponent(text)));

const writeAndShare = async (params: { content: string; fileName: string; mimeType: string }) => {
  const safeName = sanitizeFileName(params.fileName);

  const res = await Filesystem.writeFile({
    path: safeName,
    data: toBase64Utf8(params.content),
    directory: Directory.Documents,
    recursive: true,
  });

  await Share.share({
    title: 'Export',
    text: `Fichier généré : ${safeName}`,
    url: res.uri,
    dialogTitle: 'Partager le fichier',
  });
};

export const exportToCsv = async <T extends object>(rows: T[], fileName: string) => {
  const csv = Papa.unparse(rows);
  const fullName = `${fileName}.csv`;

  if (Capacitor.getPlatform() === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, sanitizeFileName(fullName));
    return;
  }

  await writeAndShare({
    content: csv,
    fileName: fullName,
    mimeType: 'text/csv;charset=utf-8',
  });
};

export const exportToJson = async (data: unknown, fileName: string) => {
  const json = JSON.stringify(data, null, 2);
  const fullName = `${fileName}.json`;

  if (Capacitor.getPlatform() === 'web') {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    triggerDownload(blob, sanitizeFileName(fullName));
    return;
  }

  await writeAndShare({
    content: json,
    fileName: fullName,
    mimeType: 'application/json;charset=utf-8',
  });
};
const triggerDownload = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = sanitizeFileName(fileName);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/*const triggerDownload = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};*/
