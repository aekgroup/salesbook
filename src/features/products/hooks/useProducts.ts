import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from '../../../data/dataProvider';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { ProductFilters } from '../../../shared/types';

export const useProducts = (filters: ProductFilters) => {
  const provider = useDataProvider();

  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => provider.products.list(filters),
    placeholderData: (previousData) => previousData,
  });
};
