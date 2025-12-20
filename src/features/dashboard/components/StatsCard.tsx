import clsx from 'clsx';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  hint?: string;
  layout?: 'default' | 'wide';
}

export const StatsCard = ({ title, value, icon, hint, layout = 'default' }: StatsCardProps) => {
  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md',
        layout === 'wide' ? 'md:col-span-2' : '',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {icon ? <div className="text-slate-400">{icon}</div> : null}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 rounded-b-3xl bg-gradient-to-r from-slate-900/10 via-slate-900/30 to-slate-900/10 opacity-0 transition group-hover:opacity-100" />
    </div>
  );
};
