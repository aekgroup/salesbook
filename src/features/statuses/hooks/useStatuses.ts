import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from '../../../data/dataProvider';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useStatuses = () => {
  const provider = useDataProvider();
  return useQuery({
    queryKey: queryKeys.statuses(),
    queryFn: () => provider.statuses.list(),
  });
};
