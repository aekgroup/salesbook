import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataProvider } from '../../../data/dataProvider';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { useToast } from '../../../shared/ui/ToastProvider';
import { PaymentMethodOption } from '../../../shared/types';
import { setActiveCurrency } from '../../../shared/state/currencyStore';
import { formatErrorForToast } from '../../../shared/utils/errorHandling';

export const usePreferenceMutations = () => {
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.preferences() });

  const updateCurrency = useMutation({
    mutationFn: (currency: string) => provider.preferences.updateCurrency(currency),
    onSuccess: (data) => {
      setActiveCurrency(data.currency);
      toast({ title: 'Devise mise à jour', variant: 'success' });
      invalidate();
    },
    onError: (error: unknown) => {
      const formattedError = formatErrorForToast(error);
      toast({ title: formattedError.title, description: formattedError.description, variant: 'error' });
    },
  });

  const addPaymentMethod = useMutation({
    mutationFn: (payload: PaymentMethodOption) => provider.preferences.addPaymentMethod(payload),
    onSuccess: () => {
      toast({ title: 'Méthode ajoutée', variant: 'success' });
      invalidate();
    },
    onError: (error: unknown) => {
      const formattedError = formatErrorForToast(error);
      toast({ title: formattedError.title, description: formattedError.description, variant: 'error' });
    },
  });

  const removePaymentMethod = useMutation({
    mutationFn: (value: string) => provider.preferences.removePaymentMethod(value),
    onSuccess: () => {
      toast({ title: 'Méthode supprimée', variant: 'success' });
      invalidate();
    },
    onError: (error: unknown) => {
      const formattedError = formatErrorForToast(error);
      toast({ title: formattedError.title, description: formattedError.description, variant: 'error' });
    },
  });

  return { updateCurrency, addPaymentMethod, removePaymentMethod };
};
