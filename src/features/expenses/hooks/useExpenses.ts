import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from '../../../data/dataProvider';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { ExpenseFilters } from '../../../shared/types';

export const useExpenses = (filters: ExpenseFilters = {}) => {
  const provider = useDataProvider();

  return useQuery({
    queryKey: queryKeys.expenses(filters),
    queryFn: () => provider.expenses.list(filters),
    placeholderData: (previous) => previous,
  });
};
