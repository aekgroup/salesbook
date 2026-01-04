import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from '../../../data/dataProvider';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { ExpenseFilters } from '../../../shared/types';

export const useExpenseSummary = (filters: ExpenseFilters = {}) => {
  const provider = useDataProvider();

  return useQuery({
    queryKey: queryKeys.expenseSummary(filters),
    queryFn: () => provider.expenses.summary(filters),
    placeholderData: (previous) => previous,
  });
};
