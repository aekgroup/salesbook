import { useMemo, useState } from 'react';
import { SUPPORTED_CURRENCIES } from '../../../shared/constants';
import { usePreferences } from '../hooks/usePreferences';
import { usePreferenceMutations } from '../hooks/usePreferenceMutations';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

export const PreferencesPage = () => {
  const { data, isLoading } = usePreferences();
  const { updateCurrency, addPaymentMethod, removePaymentMethod } = usePreferenceMutations();
  const [newMethod, setNewMethod] = useState({ label: '', value: '' });

  const currencyValue = data?.currency ?? SUPPORTED_CURRENCIES[0].value;
  const paymentMethods = useMemo(() => data?.paymentMethods ?? [], [data?.paymentMethods]);

  const handleAddMethod = () => {
    const label = newMethod.label.trim();
    const value = newMethod.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!label || !value) return;
    addPaymentMethod.mutate({ label, value }, {
      onSuccess: () => setNewMethod({ label: '', value: '' }),
    });
  };

  const disableAdd = !newMethod.label.trim() || !newMethod.value.trim();

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Préférences</h1>
        <p className="text-sm text-slate-500">Personnalisez la devise et les méthodes de paiement disponibles.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Devise principale</h2>
          <p className="text-sm text-slate-500">Choisissez la devise utilisée pour l’affichage des montants.</p>
          <select
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={currencyValue}
            disabled={updateCurrency.isPending || isLoading}
            onChange={(event) => updateCurrency.mutate(event.target.value)}
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Méthodes de paiement</h2>
          <p className="text-sm text-slate-500">Ajoutez ou supprimez les options proposées lors de la création de ventes.</p>

          <div className="mt-4 space-y-3">
            {paymentMethods.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Aucune méthode configurée.
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div key={method.value} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                    <p className="text-xs uppercase text-slate-500">{method.value}</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-rose-600"
                    loading={removePaymentMethod.isPending}
                    onClick={() => removePaymentMethod.mutate(method.value)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
            <Input
              label="Nom de la méthode"
              value={newMethod.label}
              onChange={(event) => setNewMethod((prev) => ({ ...prev, label: event.target.value }))}
              placeholder="Ex: Chèque"
            />
            <Input
              label="Identifiant (sans espaces)"
              value={newMethod.value}
              onChange={(event) => setNewMethod((prev) => ({ ...prev, value: event.target.value }))}
              placeholder="Ex: cheque"
            />
            <Button
              type="button"
              onClick={handleAddMethod}
              disabled={disableAdd}
              loading={addPaymentMethod.isPending}
            >
              Ajouter une méthode
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};
