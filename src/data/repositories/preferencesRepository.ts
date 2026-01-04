import { PreferencesService } from '../supabase/services';
import { Preferences, PaymentMethodOption } from '../../shared/types';
import { APP_CURRENCY, DEFAULT_PAYMENT_METHODS } from '../../shared/constants';

export class PreferencesRepository {
  private async getOrSeed(): Promise<Preferences> {
    const existing = await PreferencesService.get();
    if (existing) {
      return existing;
    }

    const fallback: Preferences = {
      currency: APP_CURRENCY,
      paymentMethods: DEFAULT_PAYMENT_METHODS.map((method) => ({ ...method })),
    };
    return await PreferencesService.update(fallback);
  }

  async get(): Promise<Preferences> {
    const prefs = await this.getOrSeed();
    return prefs;
  }

  async updateCurrency(currency: string): Promise<Preferences> {
    const prefs = await this.getOrSeed();
    const updated = {
      ...prefs,
      currency,
    };
    return await PreferencesService.update(updated);
  }

  async addPaymentMethod(option: PaymentMethodOption): Promise<Preferences> {
    const prefs = await this.getOrSeed();
    if (prefs.paymentMethods.some((method) => method.value === option.value)) {
      throw new Error('Cette méthode existe déjà');
    }
    const updated = {
      ...prefs,
      paymentMethods: [...prefs.paymentMethods, option],
    };
    return await PreferencesService.update(updated);
  }

  async removePaymentMethod(value: string): Promise<Preferences> {
    const prefs = await this.getOrSeed();
    const updated = {
      ...prefs,
      paymentMethods: prefs.paymentMethods.filter((method) => method.value !== value),
    };
    return await PreferencesService.update(updated);
  }
}
