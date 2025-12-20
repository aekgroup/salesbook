import { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Sale } from '../../../shared/types';
import { formatCurrency } from '../../../shared/utils/format';
import { usePaymentOptions } from '../../preferences/hooks/usePaymentOptions';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';

interface SaleTableProps {
  data: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

export const SaleTable = ({ data, onEdit, onDelete }: SaleTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const { options: paymentOptions } = usePaymentOptions();
  const paymentLabels = useMemo(
    () => Object.fromEntries(paymentOptions.map((method) => [method.value, method.label])),
    [paymentOptions],
  );

  const columns = useMemo<ColumnDef<Sale>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold text-slate-900">{format(new Date(row.original.date), 'dd MMM yyyy')}</p>
            {row.original.note && <p className="text-xs text-slate-500">{row.original.note}</p>}
          </div>
        ),
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Paiement',
        cell: ({ getValue }) => {
          const value = getValue<string | undefined>();
          return (
            <Badge variant="info">{value ? paymentLabels[value] ?? value : 'Non spécifié'}</Badge>
          );
        },
      },
      {
        accessorKey: 'items',
        header: 'Articles',
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-semibold text-slate-900">{row.original.items.length}</p>
            <p className="text-xs text-slate-500">produits</p>
          </div>
        ),
      },
      {
        accessorKey: 'totalRevenue',
        header: 'Montant',
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-slate-900">{formatCurrency(row.original.totalRevenue)}</p>
            <p className="text-xs text-emerald-600">Profit {formatCurrency(row.original.totalProfit)}</p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(row.original)}>
              Modifier
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(row.original)}>
              Supprimer
            </Button>
          </div>
        ),
      },
    ],
    [onDelete, onEdit, paymentLabels],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/75">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-4 text-sm text-slate-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <div className="p-8 text-center text-sm text-slate-500">Aucune vente pour ces filtres.</div>}
    </div>
  );
};
