import { Package2, ShoppingBag, TrendingUp, Wallet2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DASHBOARD_PERIODS } from '../../../shared/constants';
import { formatCurrency, formatNumber } from '../../../shared/utils/format';
import { DateRange } from '../../../shared/types';
import { useDashboardStats, DashboardPeriod } from '../hooks/useDashboardStats';
import { StatsCard } from '../components/StatsCard';
import { TrendChartCard } from '../components/TrendChartCard';
import { PaymentOverviewCard } from '../components/PaymentOverviewCard';
import { TopProductsCard } from '../components/TopProductsCard';
import { RecentSalesCard } from '../components/RecentSalesCard';

const normalizeDate = (value: string, endOfDay = false) => {
  if (!value) return '';
  const date = new Date(value);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString();
};

export const DashboardPage = () => {
  const [period, setPeriod] = useState<DashboardPeriod>('week');
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [customForm, setCustomForm] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const { data, isLoading, isFetching } = useDashboardStats(period, period === 'custom' ? customRange : null);

  const totals = data?.totals;
  const stock = data?.stock;

  const statCards = useMemo(
    () => [
      {
        title: 'Chiffre d’affaires',
        value: totals ? formatCurrency(totals.totalRevenue) : '—',
        hint: totals ? `${formatCurrency(totals.totalProfit)} de profit` : 'En attente des ventes',
        icon: <TrendingUp className="h-6 w-6" />,
      },
      {
        title: 'Commandes',
        value: data ? formatNumber(data.salesCount) : '—',
        hint: data ? `Panier moyen ${formatCurrency(data.avgOrderValue)}` : 'En cours de calcul',
        icon: <ShoppingBag className="h-6 w-6" />,
      },
      {
        title: 'Marge moyenne',
        value: totals ? `${totals.margin.toFixed(1)} %` : '—',
        hint: totals ? `${formatCurrency(totals.totalProfit)} de marge nette` : '',
        icon: <Wallet2 className="h-6 w-6" />,
      },
      {
        title: 'Valeur du stock',
        value: stock ? formatCurrency(stock.totalPotential) : '—',
        hint: stock ? `${formatCurrency(stock.totalCost)} de coût · ${stock.lowStockCount} bas stocks` : '',
        icon: <Package2 className="h-6 w-6" />,
        layout: 'wide' as const,
      },
    ],
    [data, stock, totals],
  );

  const handlePeriodChange = (value: DashboardPeriod) => {
    setPeriod(value);
    if (value !== 'custom') {
      setCustomRange(null);
    }
  };

  const customRangeInvalid =
    Boolean(customForm.start && customForm.end) && customForm.start > customForm.end ? 'Range invalide' : null;

  const handleApplyCustomRange = () => {
    if (!customForm.start || !customForm.end || customRangeInvalid) return;
    setCustomRange({
      start: normalizeDate(customForm.start),
      end: normalizeDate(customForm.end, true),
    });
  };

  const isCustomReady = period !== 'custom' || Boolean(customRange);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Vue globale</p>
            <h1 className="text-3xl font-semibold text-slate-900">Tableau de bord</h1>
            <p className="text-sm text-slate-500">
              Aperçu détaillé des performances commerciales et de l’état des stocks.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {DASHBOARD_PERIODS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value as DashboardPeriod)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  period === option.value ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {period === 'custom' ? (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <label className="flex-1 text-sm font-medium text-slate-600">
                Date de début
                <input
                  type="date"
                  value={customForm.start}
                  onChange={(event) => setCustomForm((prev) => ({ ...prev, start: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                />
              </label>
              <label className="flex-1 text-sm font-medium text-slate-600">
                Date de fin
                <input
                  type="date"
                  value={customForm.end}
                  onChange={(event) => setCustomForm((prev) => ({ ...prev, end: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                />
              </label>
              <button
                className="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={handleApplyCustomRange}
                disabled={!customForm.start || !customForm.end || Boolean(customRangeInvalid)}
              >
                Appliquer
              </button>
            </div>
            {customRangeInvalid ? <p className="mt-2 text-xs text-rose-500">{customRangeInvalid}</p> : null}
            {!customRange && (
              <p className="mt-2 text-xs text-slate-500">
                Sélectionnez et appliquez une plage pour charger les statistiques personnalisées.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            layout={card.layout}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TrendChartCard data={isCustomReady && data ? data.trend : []} />
          <PaymentOverviewCard data={isCustomReady && data ? data.paymentOverview : []} />
        </div>
        <div className="space-y-6">
          <TopProductsCard products={isCustomReady && data ? data.topProducts : []} />
          <RecentSalesCard sales={isCustomReady && data ? data.recentSales : []} />
        </div>
      </div>

      {(isLoading || isFetching) && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-4 text-center text-sm text-slate-500">
          Chargement des statistiques en cours...
        </div>
      )}
    </div>
  );
};
