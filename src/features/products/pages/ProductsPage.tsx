import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { Plus, Upload, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useStatuses } from '../../statuses/hooks/useStatuses';
import { ProductFilters, ProductFiltersState } from '../components/ProductFilters';
import { ProductTable } from '../components/ProductTable';
import { ProductForm } from '../components/ProductForm';
import { useProductMutations } from '../hooks/useProductMutations';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { Product, ProductFormValues } from '../../../shared/types';
import { exportToCsv, exportToJson, formatCurrency, formatNumber } from '../../../shared/utils/format';
import { useToast } from '../../../shared/ui/ToastProvider';
import { useDataProvider } from '../../../data/dataProvider';

const initialFilters: ProductFiltersState = {
  search: '',
  statusId: undefined,
  lowStockOnly: false,
};

export const ProductsPage = () => {
  const [filters, setFilters] = useState<ProductFiltersState>(initialFilters);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const dataProvider = useDataProvider();

  const productsQuery = useProducts(filters);
  const statusesQuery = useStatuses();
  const { createMutation, updateMutation, deleteMutation } = useProductMutations();

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const statuses = statusesQuery.data ?? [];

  const stockStats = useMemo(() => {
    const totalStock = products.reduce((acc, product) => acc + product.quantity, 0);
    const totalValue = products.reduce((acc, product) => acc + product.quantity * product.salePrice, 0);
    const lowStock = products.filter((product) => product.quantity <= product.reorderThreshold).length;
    return {
      totalItems: products.length,
      totalStock,
      totalValue,
      lowStock,
    };
  }, [products]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = () => {
    if (!deletingProduct) return;
    deleteMutation.mutate(deletingProduct.id);
    setDeletingProduct(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const text = await file.text();
      const parsed: Product[] = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error('Format de fichier invalide');
      }
      for (const product of parsed) {
        const { id, createdAt, updatedAt, ...input } = product;
        await dataProvider.products.create({
          ...input,
          quantity: product.quantity ?? 0,
        });
      }
      toast({ variant: 'success', title: 'Import terminé' });
    } catch (error) {
      toast({ variant: 'error', title: 'Import impossible', description: String(error) });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleExportCsv = () => {
    exportToCsv(
      products.map((product) => ({
        SKU: product.sku,
        Nom: product.name,
        Catégorie: product.category,
        Stock: product.quantity,
        'Prix vente': product.salePrice,
        'Prix achat': product.purchasePrice,
        Statut: statuses.find((s) => s.id === product.statusId)?.label ?? 'N/A',
      })),
      `produits-${new Date().toISOString()}`,
    );
  };

  const handleExportJson = () => {
    exportToJson(products, `produits-${new Date().toISOString()}`);
  };

  const handleSubmitProduct = (values: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: values }, { onSuccess: handleModalClose });
    } else {
      createMutation.mutate(values, { onSuccess: handleModalClose });
    }
  };

  const renderHeaderActions = () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" className="gap-2" onClick={handleImportClick} disabled={importing}>
        <Upload className="h-4 w-4" />
        Importer
      </Button>
      <Button variant="secondary" className="gap-2" onClick={handleExportCsv} disabled={products.length === 0}>
        <FileSpreadsheet className="h-4 w-4" />
        CSV
      </Button>
      <Button variant="secondary" className="gap-2" onClick={handleExportJson} disabled={products.length === 0}>
        <Download className="h-4 w-4" />
        JSON
      </Button>
      <Button className="gap-2" onClick={openCreateModal}>
        <Plus className="h-4 w-4" />
        Ajouter un produit
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Produits</h1>
            <p className="text-sm text-slate-500">Gérez l’ensemble du catalogue et surveillez le stock.</p>
          </div>
          {renderHeaderActions()}
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Produits" value={stockStats.totalItems} />
          <StatsCard label="Stock total" value={formatNumber(stockStats.totalStock)} />
          <StatsCard label="Valorisation" value={formatCurrency(stockStats.totalValue)} />
          <StatsCard label="Alertes stock" value={stockStats.lowStock} variant={stockStats.lowStock > 0 ? 'warning' : 'success'} />
        </dl>
      </header>

      <ProductFilters
        filters={filters}
        statuses={statuses}
        onChange={(next) => setFilters(next)}
        onReset={() => setFilters(initialFilters)}
      />

      <div>
        {productsQuery.isLoading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-slate-500">
            Chargement des produits...
          </div>
        ) : (
          <ProductTable data={products} statuses={statuses} onEdit={openEditModal} onDelete={handleDelete} />
        )}
      </div>

      <Modal
        open={isModalOpen}
        title={editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
        description="Renseignez les informations clés du produit."
        onClose={handleModalClose}
        size="lg"
      >
        {statusesQuery.isLoading ? (
          <p className="text-sm text-slate-500">Chargement des statuts...</p>
        ) : (
          <ProductForm
            defaultValues={editingProduct ?? undefined}
            statuses={statuses}
            onSubmit={handleSubmitProduct}
            onCancel={handleModalClose}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(deletingProduct)}
        title="Supprimer le produit"
        description="Cette action est irréversible."
        onClose={() => setDeletingProduct(null)}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Confirmer la suppression de <span className="font-semibold">{deletingProduct?.name}</span> ?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeletingProduct(null)}>
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
  variant?: 'default' | 'warning' | 'success';
}

const variantMap = {
  default: 'text-slate-900',
  warning: 'text-amber-600',
  success: 'text-emerald-600',
};

const StatsCard = ({ label, value, variant = 'default' }: StatsCardProps) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${variantMap[variant]}`}>{value}</p>
  </div>
);
