import { ReactNode, useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Product, Status } from '../../../shared/types';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import { formatCurrency } from '../../../shared/utils/format';

interface ProductTableProps {
  data: Product[];
  statuses?: Status[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const LOW_STOCK_BADGE: ReactNode = (
  <Badge variant="warning" className="text-xs">
    Stock bas
  </Badge>
);

export const ProductTable = ({ data, statuses = [], onEdit, onDelete }: ProductTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold text-slate-900">{row.original.name}</p>
            <p className="text-xs text-slate-500">{row.original.sku}</p>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Catégorie',
        cell: ({ getValue }) => <p className="text-sm text-slate-600">{getValue<string>() || 'N/A'}</p>,
      },
      {
        accessorKey: 'statusId',
        header: 'Statut',
        cell: ({ getValue }) => {
          const status = statuses.find((s) => s.id === getValue<string>());
          return (
            <Badge
              style={{
                backgroundColor: `${status?.color ?? '#e2e8f0'}20`,
                color: status?.color ?? '#1e293b',
              }}
            >
              {status?.label ?? 'Sans statut'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Stock',
        cell: ({ row }) => {
          const product = row.original;
          const isLow = product.quantity <= product.reorderThreshold;
          return (
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-900">{product.quantity}</p>
              <p className="text-xs text-slate-500">Seuil: {product.reorderThreshold}</p>
              {isLow && LOW_STOCK_BADGE}
            </div>
          );
        },
      },
      {
        accessorKey: 'salePrice',
        header: 'Prix',
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-slate-900">{formatCurrency(row.original.salePrice)}</p>
            <p className="text-xs text-slate-500">Coût: {formatCurrency(row.original.purchasePrice)}</p>
            <p className="text-xs text-emerald-600">
              Marge: {formatCurrency(row.original.salePrice - row.original.purchasePrice)}
            </p>
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
    [onDelete, onEdit, statuses],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
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
      {data.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-500">Aucun produit ne correspond aux filtres.</div>
      )}
    </div>
  );
};
