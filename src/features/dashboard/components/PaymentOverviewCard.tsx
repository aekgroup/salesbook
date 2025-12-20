import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { DashboardPaymentStat } from '../../../data/repositories/reportsRepository';
import { formatCurrency } from '../../../shared/utils/format';

const COLORS = ['#0f172a', '#2563eb', '#a855f7', '#f97316', '#ef4444', '#10b981'];

interface PaymentOverviewCardProps {
  data: DashboardPaymentStat[];
}

const PaymentTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as DashboardPaymentStat;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow">
      <p className="font-medium">{item.label}</p>
      <p>{item.salesCount} ventes</p>
      <p>{formatCurrency(item.revenue)}</p>
      <p className="text-[11px] text-slate-500">{item.share.toFixed(1)}% du CA</p>
    </div>
  );
};

export const PaymentOverviewCard = ({ data }: PaymentOverviewCardProps) => {
  const totalRevenue = data.reduce((acc, item) => acc + item.revenue, 0);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Modes de paiement</p>
          <p className="text-xl font-semibold text-slate-900">Répartition des ventes</p>
        </div>
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalRevenue)}</span>
      </div>
      {data.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          Pas encore de ventes sur la période.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <div className="h-56 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<PaymentTooltip />} />
                <Pie data={data} dataKey="share" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {data.map((entry, index) => (
                    <Cell key={entry.method} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {data.map((item, index) => (
              <div key={item.method} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.salesCount} ventes · {item.share.toFixed(1)}%</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.revenue)}</p>
                <div
                  className="ml-3 h-2 w-16 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
