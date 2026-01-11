import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataProvider } from '../../../data/dataProvider';
import { SaleFormValues, UUID } from '../../../shared/types';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { useToast } from '../../../shared/ui/ToastProvider';
import { formatErrorForToast } from '../../../shared/utils/errorHandling';

export const useSaleMutations = () => {
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateCollections = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.sales() });
    queryClient.invalidateQueries({ queryKey: queryKeys.products() });
  };

  const createMutation = useMutation({
    mutationFn: (input: SaleFormValues) => provider.sales.create(input),
    onSuccess: () => {
      invalidateCollections();
      toast({ variant: 'success', title: 'Vente enregistrée' });
    },
    onError: (error: unknown) => {
      const formattedError = formatErrorForToast(error);
      toast({ variant: 'error', title: formattedError.title, description: formattedError.description });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: UUID; data: SaleFormValues }) => provider.sales.update(id, data),
    onSuccess: () => {
      invalidateCollections();
      toast({ variant: 'success', title: 'Vente mise à jour' });
    },
    onError: (error: unknown) => {
      const formattedError = formatErrorForToast(error);
      toast({ variant: 'error', title: formattedError.title, description: formattedError.description });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: UUID) => provider.sales.remove(id),
    onSuccess: () => {
      invalidateCollections();
      toast({ variant: 'success', title: 'Vente supprimée' });
    },
    onError: (error: unknown) => {
      const formattedError = formatErrorForToast(error);
      toast({ variant: 'error', title: formattedError.title, description: formattedError.description });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
