import { ChangeEvent } from 'react';
import { subDays } from 'date-fns';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { usePaymentOptions } from '../../preferences/hooks/usePaymentOptions';
import type { PaymentMethod, SaleFilters as SaleFiltersType } from '../../../shared/types';

export type SaleFiltersState = SaleFiltersType;

export interface SaleFiltersProps {
  filters: SaleFiltersState;
  onChange: (filters: SaleFiltersState) => void;
  onReset: () => void;
}

const quickRanges = [
  { label: '7 jours', value: 7 },
  { label: '30 jours', value: 30 },
  { label: '90 jours', value: 90 },
];

export const SaleFilters = ({ filters, onChange, onReset }: SaleFiltersProps) => {
  const updateFilter = (partial: Partial<SaleFiltersState>) => {
    onChange({ ...filters, ...partial });
  };
  const { options: paymentOptions } = usePaymentOptions();

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const nextRange =
      value.length === 0
        ? undefined
        : {
            ...(filters.range ?? { start: '', end: '' }),
            [name]: value,
          };
    updateFilter({ range: nextRange });
  };

  const applyQuickRange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    updateFilter({ range: { start: start.toISOString(), end: end.toISOString() } });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Recherche"
          name="search"
          placeholder="Note, référence..."
          value={filters.search ?? ''}
          onChange={(event) => updateFilter({ search: event.target.value })}
        />
        <Select
          label="Méthode de paiement"
          name="paymentMethod"
          value={filters.paymentMethod ?? ''}
          onChange={(event) =>
            updateFilter({ paymentMethod: (event.target.value || undefined) as PaymentMethod | undefined })
          }
        >
          <option value="">Toutes les méthodes</option>
          {paymentOptions.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </Select>
        <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          <span>Période personnalisée</span>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              name="start"
              value={filters.range?.start ? filters.range.start.slice(0, 10) : ''}
              onChange={handleRangeChange}
            />
            <Input
              type="date"
              name="end"
              value={filters.range?.end ? filters.range.end.slice(0, 10) : ''}
              onChange={handleRangeChange}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
          {quickRanges.map((range) => (
            <button
              key={range.value}
              type="button"
              className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
              onClick={() => applyQuickRange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={onReset}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};
