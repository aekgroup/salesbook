import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardTrendPoint } from '../../../data/repositories/reportsRepository';
import { formatCurrency } from '../../../shared/utils/format';

interface TrendChartCardProps {
  data: DashboardTrendPoint[];
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  const revenue = point.payload.revenue;
  const profit = point.payload.profit;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow">
      <p className="font-medium">{label}</p>
      <p className="mt-1">Revenu: {formatCurrency(revenue)}</p>
      <p>Bénéfice: {formatCurrency(profit)}</p>
    </div>
  );
};

export const TrendChartCard = ({ data }: TrendChartCardProps) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Tendance des revenus</p>
          <p className="text-xl font-semibold text-slate-900">Performance cumulée</p>
        </div>
      </div>
      <div className="mt-6 h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Aucune vente dans la période.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, top: 10, right: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis
                tickFormatter={(value) => formatCurrency(value).replace('€', '€')}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#475569' }}
                width={80}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0f172a"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                name="Revenu"
              />
              <Area type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={2} fillOpacity={0} name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
