import { APP_CURRENCY } from '../constants';

let activeCurrency = APP_CURRENCY;

export const getActiveCurrency = () => activeCurrency;

export const setActiveCurrency = (currency: string) => {
  activeCurrency = currency;
};
