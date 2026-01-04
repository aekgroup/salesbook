import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Plus, Trash2, Pencil, Wallet } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../../shared/constants';
import { formatCurrency } from '../../../shared/utils/format';
import { Expense, ExpenseFilters, ExpenseFormValues, expenseSchema } from '../../../shared/types';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Textarea } from '../../../shared/ui/Textarea';
import { Modal } from '../../../shared/ui/Modal';
import { useExpenses } from '../hooks/useExpenses';
import { useExpenseSummary } from '../hooks/useExpenseSummary';
import { useExpenseMutations } from '../hooks/useExpenseMutations';

const defaultFilters: ExpenseFilters = { search: '', category: undefined, range: undefined };

export const ExpensesPage = () => {
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const expenseQuery = useExpenses(filters);
  const summaryQuery = useExpenseSummary(filters);
  const { createMutation, updateMutation, deleteMutation } = useExpenseMutations();

  const expenses = expenseQuery.data ?? [];
  const summary = summaryQuery.data;

  const categories = useMemo(() => EXPENSE_CATEGORIES, []);

  const handleResetFilters = () => setFilters(defaultFilters);

  const openCreateModal = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleDelete = (expense: Expense) => setDeletingExpense(expense);

  const confirmDelete = () => {
    if (!deletingExpense) return;
    deleteMutation.mutate(deletingExpense.id, {
      onSuccess: () => setDeletingExpense(null),
    });
  };

  const dateRangeInvalid =
    filters.range?.start && filters.range?.end && filters.range.start > filters.range.end ? 'Dates invalides' : null;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Suivi financier</p>
            <h1 className="text-3xl font-semibold text-slate-900">Dépenses</h1>
            <p className="text-sm text-slate-500">
              Ajoutez les frais de livraison, commissions et dépenses diverses pour suivre la rentabilité réelle.
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Nouvelle dépense
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Total des dépenses"
            value={summary ? formatCurrency(summary.total) : '—'}
            hint={`Sur ${expenses.length} enregistrements`}
          />
          <SummaryCard
            label="Catégorie principale"
            value={getTopCategoryLabel(summary?.categories, categories) ?? '—'}
            hint="Catégorie la plus coûteuse"
          />
          <SummaryCard
            label="Dépenses filtrées"
            value={summary ? formatCurrency(summary.total) : '—'}
            hint="Total période sélectionnée"
            icon={<Wallet className="h-6 w-6" />}
          />
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Filtres</h2>
        <Filters filters={filters} onChange={setFilters} onReset={handleResetFilters} dateError={dateRangeInvalid} />
      </section>

      <section className="rounded-3xl bg-white p-0 shadow-sm">
        <ExpenseTable expenses={expenses} onEdit={openEditModal} onDelete={handleDelete} loading={expenseQuery.isLoading} />
      </section>

      <ExpenseModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        editingExpense={editingExpense}
        onSubmit={(values) => {
          if (editingExpense) {
            updateMutation.mutate(
              { id: editingExpense.id, values },
              { onSuccess: () => setModalOpen(false) },
            );
          } else {
            createMutation.mutate(values, { onSuccess: () => setModalOpen(false) });
          }
        }}
        loading={editingExpense ? updateMutation.isPending : createMutation.isPending}
      />

      <Modal
        open={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        title="Supprimer la dépense"
        description="Cette action est irréversible."
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Confirmer la suppression de <span className="font-semibold">{deletingExpense?.label}</span> ?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeletingExpense(null)}>
              Annuler
            </Button>
            <Button variant="danger" className="gap-2" loading={deleteMutation.isPending} onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" /> Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
      {icon && <div className="text-slate-400">{icon}</div>}
    </div>
  </div>
);

const getTopCategoryLabel = (
  categories?: Record<string, number>,
  options?: readonly { value: string; label: string }[],
) => {
  if (!categories) return undefined;
  const [topKey] = Object.entries(categories).sort((a, b) => b[1] - a[1])[0] ?? [];
  return options?.find((opt) => opt.value === topKey)?.label ?? topKey;
};

interface FiltersProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
  onReset: () => void;
  dateError: string | null;
}

const Filters = ({ filters, onChange, onReset, dateError }: FiltersProps) => {
  const updateFilter = (partial: Partial<ExpenseFilters>) => onChange({ ...filters, ...partial });

  const formatInputDate = (iso?: string) => (iso ? iso.slice(0, 10) : '');

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (!value) {
      if (!filters.range) return;
      const remaining = { ...filters.range };
      delete remaining[type];
      const normalized = Object.keys(remaining).length ? (remaining as ExpenseFilters['range']) : undefined;
      updateFilter({ range: normalized });
      return;
    }

    const iso = new Date(value).toISOString();
    updateFilter({
      range: {
        ...(filters.range ?? {}),
        [type]: iso,
      },
    });
  };

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-4">
      <Input
        label="Recherche"
        placeholder="Libellé ou note"
        value={filters.search ?? ''}
        onChange={(event) => updateFilter({ search: event.target.value })}
      />
      <Select
        label="Catégorie"
        value={filters.category ?? ''}
        onChange={(event) => updateFilter({ category: event.target.value || undefined })}
      >
        <option value="">Toutes</option>
        {EXPENSE_CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </Select>
      <Input
        type="date"
        label="Date début"
        value={formatInputDate(filters.range?.start)}
        onChange={(event) => handleDateChange('start', event.target.value)}
        error={dateError ?? undefined}
      />
      <Input
        type="date"
        label="Date fin"
        value={formatInputDate(filters.range?.end)}
        onChange={(event) => handleDateChange('end', event.target.value)}
        error={dateError ?? undefined}
      />
      <div className="md:col-span-4">
        <Button variant="secondary" onClick={onReset}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

interface ExpenseTableProps {
  expenses: Expense[];
  loading?: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const ExpenseTable = ({ expenses, loading, onEdit, onDelete }: ExpenseTableProps) => {
  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Chargement des dépenses…</div>;
  }

  if (expenses.length === 0) {
    return <div className="p-6 text-center text-sm text-slate-500">Aucune dépense trouvée.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Libellé</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Catégorie</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Montant</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 text-sm text-slate-600">{format(new Date(expense.date), 'dd MMM yyyy')}</td>
              <td className="px-4 py-3 text-sm text-slate-900">
                <p className="font-semibold">{expense.label}</p>
                {expense.note && <p className="text-xs text-slate-500">{expense.note}</p>}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {EXPENSE_CATEGORIES.find((cat) => cat.value === expense.category)?.label ?? expense.category}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                {formatCurrency(expense.amount)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(expense)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(expense)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  categories: readonly { value: string; label: string }[];
  editingExpense: Expense | null;
  onSubmit: (values: ExpenseFormValues) => void;
  loading?: boolean;
}

const ExpenseModal = ({ open, onClose, categories, editingExpense, onSubmit, loading }: ExpenseModalProps) => {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      label: '',
      category: categories[0]?.value ?? 'other',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      note: '',
    },
  });

  const { register, handleSubmit, reset, formState } = form;

  useEffect(() => {
    if (editingExpense) {
      reset({
        id: editingExpense.id,
        label: editingExpense.label,
        category: editingExpense.category,
        amount: editingExpense.amount,
        date: editingExpense.date.slice(0, 10),
        note: editingExpense.note ?? '',
      });
    } else {
      reset({
        label: '',
        category: categories[0]?.value ?? 'other',
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        note: '',
      });
    }
  }, [editingExpense, categories, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit((values) => {
    onSubmit({
      ...values,
      amount: Number(values.amount),
      date: values.date ?? new Date().toISOString(),
    });
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}
      description="Renseignez les frais additionnels"
      size="md"
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Libellé" {...register('label')} error={formState.errors.label?.message} placeholder="Livraison DHL" />
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Catégorie" {...register('category')}>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            step="0.01"
            label="Montant"
            {...register('amount', { valueAsNumber: true })}
            error={formState.errors.amount?.message}
          />
        </div>
        <Input type="date" label="Date" {...register('date')} error={formState.errors.date?.message} />
        <Textarea label="Note" placeholder="Détails optionnels" {...register('note')} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" loading={loading}>
            {editingExpense ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
