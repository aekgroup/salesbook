import { useMemo } from 'react';
import { usePreferences } from './usePreferences';
import { DEFAULT_PAYMENT_METHODS } from '../../../shared/constants';

export const usePaymentOptions = () => {
  const query = usePreferences();

  const options = useMemo(() => {
    if (query.data?.paymentMethods && query.data.paymentMethods.length > 0) {
      return query.data.paymentMethods;
    }
    return DEFAULT_PAYMENT_METHODS.map((method) => ({ ...method }));
  }, [query.data?.paymentMethods]);

  return { ...query, options };
};
