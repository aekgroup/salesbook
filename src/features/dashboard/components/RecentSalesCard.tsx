import { Sale } from '../../../shared/types';
import { formatCurrency, formatDate } from '../../../shared/utils/format';

interface RecentSalesCardProps {
  sales: Sale[];
}

export const RecentSalesCard = ({ sales }: RecentSalesCardProps) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Ventes récentes</p>
          <p className="text-xl font-semibold text-slate-900">5 dernières opérations</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {sales.length} / 5
        </span>
      </div>
      {sales.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          Ajoutez vos premières ventes pour alimenter le tableau.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {sales.map((sale) => (
            <li key={sale.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {sale.note?.length ? sale.note : 'Vente sans note'}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(sale.date, 'dd MMM yyyy HH:mm')} · {sale.items.length} article(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(sale.totalRevenue)}</p>
                <p className="text-xs text-emerald-600">+{formatCurrency(sale.totalProfit)} profit</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
