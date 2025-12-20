import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/ui/ToastProvider';
import { useDataProvider } from '../../../data/dataProvider';
import { ProductFormValues, UUID } from '../../../shared/types';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useProductMutations = () => {
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products() });
  };

  const createMutation = useMutation({
    mutationFn: (input: ProductFormValues) => provider.products.create(input),
    onSuccess: () => {
      invalidateProducts();
      toast({ variant: 'success', title: 'Produit ajouté' });
    },
    onError: (error: unknown) => {
      toast({ variant: 'error', title: 'Erreur', description: getErrorMessage(error) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: UUID; data: Partial<ProductFormValues> }) => provider.products.update(id, data),
    onSuccess: () => {
      invalidateProducts();
      toast({ variant: 'success', title: 'Produit mis à jour' });
    },
    onError: (error: unknown) => {
      toast({ variant: 'error', title: 'Erreur', description: getErrorMessage(error) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: UUID) => provider.products.remove(id),
    onSuccess: () => {
      invalidateProducts();
      toast({ variant: 'success', title: 'Produit supprimé' });
    },
    onError: (error: unknown) => {
      toast({ variant: 'error', title: 'Erreur', description: getErrorMessage(error) });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return 'Une erreur inattendue est survenue.';
};
