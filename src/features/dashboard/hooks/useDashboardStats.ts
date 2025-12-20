import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDataProvider } from '../../../data/dataProvider';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { DateRange } from '../../../shared/types';

export type DashboardPeriod = 'day' | 'week' | 'month' | 'custom';

export const useDashboardStats = (period: DashboardPeriod, range?: DateRange | null) => {
  const provider = useDataProvider();

  const effectiveRange = useMemo(() => {
    if (period !== 'custom') return null;
    if (!range?.start || !range?.end) return null;
    return range;
  }, [period, range]);

  return useQuery({
    queryKey: queryKeys.dashboard(period, effectiveRange),
    queryFn: () => provider.reports.getDashboardStats(period, effectiveRange ?? undefined),
    enabled: period !== 'custom' || Boolean(effectiveRange),
    placeholderData: (previous) => previous,
  });
};
