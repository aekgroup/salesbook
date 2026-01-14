import { ChangeEvent } from 'react';
import { Status } from '../../../shared/types';
import { Badge } from '../../../shared/ui/Badge';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Button } from '../../../shared/ui/Button';
import { RefreshCcw } from 'lucide-react';

export interface ProductFiltersState {
  search: string;
  statusId?: string;
  lowStockOnly: boolean;
  stockMovement?: 'sold' | 'received' | 'unchanged';
}

export interface ProductFiltersProps {
  filters: ProductFiltersState;
  statuses: Status[];
  onChange: (filters: ProductFiltersState) => void;
  onReset: () => void;
}

export const ProductFilters = ({ filters, statuses, onChange, onReset }: ProductFiltersProps) => {
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, [event.target.name]: event.target.value });
  };

  const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, [event.target.name]: event.target.value || undefined });
  };

  const toggleLowStock = () => {
    onChange({ ...filters, lowStockOnly: !filters.lowStockOnly });
  };

  const handleStockMovementFilter = (movement?: 'sold' | 'received' | 'unchanged') => {
    onChange({ ...filters, stockMovement: filters.stockMovement === movement ? undefined : movement });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4">
        <Input
          label="Recherche"
          name="search"
          placeholder="Nom, SKU, catégorie..."
          value={filters.search}
          onChange={handleInput}
        />
        <Select label="Statut" name="statusId" value={filters.statusId ?? ''} onChange={handleSelect}>
          <option value="">Tous les statuts</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </Select>
        <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          <span>Stock</span>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filters.lowStockOnly ? 'warning' : 'default'}
              className="cursor-pointer"
              onClick={toggleLowStock}
            >
              {filters.lowStockOnly ? 'Seulement seuil bas' : 'Tous les niveaux'}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          <span>Mouvements</span>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filters.stockMovement === 'sold' ? 'danger' : 'default'}
              className="cursor-pointer"
              onClick={() => handleStockMovementFilter('sold')}
            >
              Vendus
            </Badge>
            <Badge
              variant={filters.stockMovement === 'received' ? 'success' : 'default'}
              className="cursor-pointer"
              onClick={() => handleStockMovementFilter('received')}
            >
              Reçus
            </Badge>
            <Badge
              variant={filters.stockMovement === 'unchanged' ? 'info' : 'default'}
              className="cursor-pointer"
              onClick={() => handleStockMovementFilter('unchanged')}
            >
              Stables
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="secondary" className="gap-2" onClick={onReset}>
          <RefreshCcw className="h-4 w-4" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};
