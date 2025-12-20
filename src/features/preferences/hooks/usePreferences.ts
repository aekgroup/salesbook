import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from '../../../data/dataProvider';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { setActiveCurrency } from '../../../shared/state/currencyStore';

export const usePreferences = () => {
  const provider = useDataProvider();

  const query = useQuery({
    queryKey: queryKeys.preferences(),
    queryFn: () => provider.preferences.get(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data?.currency) {
      setActiveCurrency(query.data.currency);
    }
  }, [query.data?.currency]);

  return query;
};
