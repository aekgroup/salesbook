import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataProvider } from '../../../data/dataProvider';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { ExpenseFormValues, UUID } from '../../../shared/types';
import { useToast } from '../../../shared/ui/ToastProvider';

export const useExpenseMutations = () => {
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses() });
    queryClient.invalidateQueries({ queryKey: queryKeys.expenseSummary() });
    queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false });
  };

  const createMutation = useMutation({
    mutationFn: (values: ExpenseFormValues) => provider.expenses.create(values),
    onSuccess: () => {
      toast({ title: 'Dépense ajoutée', variant: 'success' });
      invalidate();
    },
    onError: (error: Error) => {
      toast({ title: 'Impossible d’ajouter la dépense', description: error.message, variant: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: UUID; values: Partial<ExpenseFormValues> }) =>
      provider.expenses.update(id, values),
    onSuccess: () => {
      toast({ title: 'Dépense mise à jour', variant: 'success' });
      invalidate();
    },
    onError: (error: Error) => {
      toast({ title: 'Impossible de mettre à jour', description: error.message, variant: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: UUID) => provider.expenses.remove(id),
    onSuccess: () => {
      toast({ title: 'Dépense supprimée', variant: 'success' });
      invalidate();
    },
    onError: (error: Error) => {
      toast({ title: 'Impossible de supprimer', description: error.message, variant: 'error' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
