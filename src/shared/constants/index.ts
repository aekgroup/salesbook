import { LucideIcon, Activity, Layers3, ReceiptText, Settings } from 'lucide-react';

export interface NavLink {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', path: '/', icon: Activity },
  { label: 'Produits', path: '/products', icon: Layers3 },
  { label: 'Ventes', path: '/sales', icon: ReceiptText },
  { label: 'Préférences', path: '/preferences', icon: Settings },
];

export const APP_VERSION = '0.1.0';

export const APP_LOCALE = 'fr-FR';
export const APP_CURRENCY = 'MAD';

export const DEFAULT_STATUSES = [
  { label: 'Disponible', color: '#16a34a', isDefault: true, order: 0 },
  { label: 'Réservé', color: '#f59e0b', isDefault: false, order: 1 },
  { label: 'En livraison', color: '#0ea5e9', isDefault: false, order: 2 },
  { label: 'Rupture', color: '#ef4444', isDefault: false, order: 3 },
];

export const DEFAULT_PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'card', label: 'Carte' },
  { value: 'transfer', label: 'Virement' },
  { value: 'mobile-money', label: 'Mobile Money' },
] as const;

export const PAYMENT_METHODS = DEFAULT_PAYMENT_METHODS;

export const SUPPORTED_CURRENCIES = [
  { value: 'MAD', label: 'Dirham marocain (MAD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar américain (USD)' },
  { value: 'XOF', label: 'Franc CFA (XOF)' },
  { value: 'GBP', label: 'Livre sterling (GBP)' },
] as const;

export const DASHBOARD_PERIODS = [
  { label: 'Aujourd’hui', value: 'day' },
  { label: '7 jours', value: 'week' },
  { label: '30 jours', value: 'month' },
  { label: 'Personnalisé', value: 'custom' },
] as const;
