import { useMemo, useState } from 'react';
import { Plus, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Sale, SaleFormValues } from '../../../shared/types';
import { SaleFilters, SaleFiltersState } from '../components/SaleFilters';
import { SaleTable } from '../components/SaleTable';
import { SaleForm } from '../components/SaleForm';
import { useSales } from '../hooks/useSales';
import { useSaleMutations } from '../hooks/useSaleMutations';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { exportToCsv, exportToJson, formatCurrency } from '../../../shared/utils/format';
import { useProducts } from '../../products/hooks/useProducts';
import { ProductFilters } from '../../../shared/types';

const initialSaleFilters: SaleFiltersState = {
  search: '',
  paymentMethod: undefined,
  range: undefined,
};

export const SalesPage = () => {
  const [filters, setFilters] = useState<SaleFiltersState>(initialSaleFilters);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);
  const emptyProductFilters = useMemo<ProductFilters>(() => ({}), []);

  const salesQuery = useSales(filters);
  const productsQuery = useProducts(emptyProductFilters);
  const { createMutation, updateMutation, deleteMutation } = useSaleMutations();
  const sales = salesQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const summary = useMemo(() => {
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalRevenue, 0);
    const totalProfit = sales.reduce((acc, sale) => acc + sale.totalProfit, 0);
    const totalOrders = sales.length;
    const avgOrder = totalOrders === 0 ? 0 : totalRevenue / totalOrders;
    return { totalRevenue, totalProfit, totalOrders, avgOrder };
  }, [sales]);

  const openCreateModal = () => {
    setEditingSale(null);
    setModalOpen(true);
  };

  const openEditModal = (sale: Sale) => {
    setEditingSale(sale);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSale(null);
  };

  const saleToFormValues = (sale: Sale): SaleFormValues => ({
    id: sale.id,
    date: sale.date,
    paymentMethod: sale.paymentMethod,
    note: sale.note,
    items: sale.items.map((item) => ({
      productId: item.productId,
      qty: item.qty,
      unitSalePrice: item.unitSalePrice,
      unitCostPrice: item.unitCostPrice,
      allowNegativeStock: false,
    })),
  });

  const handleSubmitSale = (values: SaleFormValues) => {
    if (editingSale) {
      updateMutation.mutate(
        { id: editingSale.id, data: values },
        {
          onSuccess: () => closeModal(),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => closeModal(),
      });
    }
  };

  const handleDelete = (sale: Sale) => {
    setDeletingSale(sale);
  };

  const confirmDelete = () => {
    if (!deletingSale) return;
    deleteMutation.mutate(deletingSale.id, {
      onSuccess: () => setDeletingSale(null),
    });
  };

  const handleExportCsv = () => {
    exportToCsv(
      sales.map((sale) => ({
        Date: format(new Date(sale.date), 'dd/MM/yyyy'),
        Montant: sale.totalRevenue,
        Profit: sale.totalProfit,
        Paiement: sale.paymentMethod ?? 'N/A',
        Articles: sale.items.length,
        Note: sale.note ?? '',
      })),
      `ventes-${new Date().toISOString()}`,
    );
  };

  const handleExportJson = () => {
    exportToJson(sales, `ventes-${new Date().toISOString()}`);
  };

  const renderHeaderActions = () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" className="gap-2" onClick={handleExportCsv} disabled={sales.length === 0}>
        <FileSpreadsheet className="h-4 w-4" />
        CSV
      </Button>
      <Button variant="secondary" className="gap-2" onClick={handleExportJson} disabled={sales.length === 0}>
        <Download className="h-4 w-4" />
        JSON
      </Button>
      <Button className="gap-2" onClick={openCreateModal} disabled={products.length === 0}>
        <Plus className="h-4 w-4" />
        Nouvelle vente
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 ">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Ventes</h1>
            <p className="text-sm text-slate-500">Automatisez les opérations de vente et suivez l’historique.</p>
          </div>
          {renderHeaderActions()}
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Commandes" value={summary.totalOrders} />
          <StatsCard label="Revenu" value={formatCurrency(summary.totalRevenue)} />
          <StatsCard label="Profit" value={formatCurrency(summary.totalProfit)} variant="success" />
          <StatsCard label="Panier moyen" value={formatCurrency(summary.avgOrder)} />
        </dl>
      </header>

      <SaleFilters filters={filters} onChange={setFilters} onReset={() => setFilters(initialSaleFilters)} />

      {salesQuery.isLoading ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-slate-500">
          Chargement des ventes...
        </div>
      ) : (
        <SaleTable data={sales} onEdit={openEditModal} onDelete={handleDelete} />
      )}

      <Modal
        open={isModalOpen}
        title={editingSale ? 'Modifier la vente' : 'Nouvelle vente'}
        description="Renseignez les produits vendus et le mode de paiement."
        onClose={closeModal}
        size="lg"
      >
        <SaleForm
          defaultValues={editingSale ? saleToFormValues(editingSale) : undefined}
          products={products}
          onSubmit={handleSubmitSale}
          onCancel={closeModal}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <Modal
        open={Boolean(deletingSale)}
        title="Supprimer la vente"
        description="Cette action est irréversible."
        onClose={() => setDeletingSale(null)}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Confirmer la suppression de la vente du{' '}
            <span className="font-semibold">
              {deletingSale ? format(new Date(deletingSale.date), 'dd MMM yyyy') : ''}
            </span>{' '}
            ?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeletingSale(null)}>
              Annuler
            </Button>
            <Button variant="danger" className="gap-2" onClick={confirmDelete} loading={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface StatsCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success';
}

const variantMap = {
  default: 'text-slate-900',
  success: 'text-emerald-600',
};

const StatsCard = ({ label, value, variant = 'default' }: StatsCardProps) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${variantMap[variant]}`}>{value}</p>
  </div>
);
