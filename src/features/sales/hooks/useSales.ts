import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from '../../../data/dataProvider';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { SaleFilters } from '../../../shared/types';

export const useSales = (filters: SaleFilters = {}) => {
  const provider = useDataProvider();

  return useQuery({
    queryKey: queryKeys.sales(filters),
    queryFn: () => provider.sales.list(filters),
    placeholderData: (previous) => previous,
  });
};
