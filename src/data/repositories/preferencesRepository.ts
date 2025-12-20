import { db, ensureSeeded } from '../dexie/db';
import { Preferences, PaymentMethodOption } from '../../shared/types';
import { APP_CURRENCY, DEFAULT_PAYMENT_METHODS } from '../../shared/constants';

const PREFERENCES_ID = 'default';

export class PreferencesRepository {
  private async getOrSeed(): Promise<Preferences & { id: string; updatedAt: string }> {
    await ensureSeeded();
    const existing = await db.preferences.get(PREFERENCES_ID);
    if (existing) {
      return existing;
    }

    const fallback: Preferences & { id: string; updatedAt: string } = {
      id: PREFERENCES_ID,
      currency: APP_CURRENCY,
      paymentMethods: DEFAULT_PAYMENT_METHODS.map((method) => ({ ...method })),
      updatedAt: new Date().toISOString(),
    };
    await db.preferences.add(fallback);
    return fallback;
  }

  async get(): Promise<Preferences> {
    const prefs = await this.getOrSeed();
    return { currency: prefs.currency, paymentMethods: prefs.paymentMethods };
  }

  async updateCurrency(currency: string): Promise<Preferences> {
    const prefs = await this.getOrSeed();
    const updated = {
      ...prefs,
      currency,
      updatedAt: new Date().toISOString(),
    };
    await db.preferences.put(updated);
    return { currency: updated.currency, paymentMethods: updated.paymentMethods };
  }

  async addPaymentMethod(option: PaymentMethodOption): Promise<Preferences> {
    const prefs = await this.getOrSeed();
    if (prefs.paymentMethods.some((method) => method.value === option.value)) {
      throw new Error('Cette méthode existe déjà');
    }
    const updated = {
      ...prefs,
      paymentMethods: [...prefs.paymentMethods, option],
      updatedAt: new Date().toISOString(),
    };
    await db.preferences.put(updated);
    return { currency: updated.currency, paymentMethods: updated.paymentMethods };
  }

  async removePaymentMethod(value: string): Promise<Preferences> {
    const prefs = await this.getOrSeed();
    const updated = {
      ...prefs,
      paymentMethods: prefs.paymentMethods.filter((method) => method.value !== value),
      updatedAt: new Date().toISOString(),
    };
    await db.preferences.put(updated);
    return { currency: updated.currency, paymentMethods: updated.paymentMethods };
  }
}
