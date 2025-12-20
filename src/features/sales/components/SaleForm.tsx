import { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useForm, Resolver, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaleFormValues, saleSchema, Product } from '../../../shared/types';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Button } from '../../../shared/ui/Button';
import { formatCurrency } from '../../../shared/utils/format';
import { usePaymentOptions } from '../../preferences/hooks/usePaymentOptions';

interface SaleFormProps {
  defaultValues?: SaleFormValues;
  products: Product[];
  onSubmit: (values: SaleFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

const buildDefaultItem = (product?: Product) => ({
  productId: product?.id ?? '',
  qty: 1,
  unitSalePrice: product?.salePrice ?? 0,
  unitCostPrice: product?.purchasePrice ?? 0,
  allowNegativeStock: false,
});

const buildDefaultItems = (products: Product[]) => {
  const firstProduct = products[0];
  return [buildDefaultItem(firstProduct)];
};

export const SaleForm = ({ defaultValues, products, onSubmit, onCancel, loading }: SaleFormProps) => {
  const { options: paymentOptions } = usePaymentOptions();
  const normalizedDefaults = useMemo(() => {
    if (!defaultValues) return undefined;
    return {
      ...defaultValues,
      items: defaultValues.items.map((item) => ({
        ...item,
        allowNegativeStock: item.allowNegativeStock ?? false,
      })),
    };
  }, [defaultValues]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema) as Resolver<SaleFormValues>,
    defaultValues:
      normalizedDefaults ??
      ({
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: undefined,
        note: '',
        items: buildDefaultItems(products),
      } satisfies SaleFormValues),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    if (normalizedDefaults) {
      reset(normalizedDefaults);
    }
  }, [normalizedDefaults, reset]);

  const items = watch('items');

  const totals = useMemo(() => {
    const totalRevenue = items.reduce((acc, item) => acc + item.qty * item.unitSalePrice, 0);
    const totalCost = items.reduce((acc, item) => acc + item.qty * item.unitCostPrice, 0);
    const totalProfit = totalRevenue - totalCost;
    return { totalRevenue, totalCost, totalProfit };
  }, [items]);

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((item) => item.id === productId);
    setValue(`items.${index}.productId`, productId);
    if (product) {
      setValue(`items.${index}.unitSalePrice`, product.salePrice);
      setValue(`items.${index}.unitCostPrice`, product.purchasePrice);
    }
  };

  const disableActions = loading || products.length === 0;

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit as SubmitHandler<SaleFormValues>)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Input
              type="date"
              label="Date"
              value={field.value ? field.value.slice(0, 10) : ''}
              onChange={(event) => field.onChange(event.target.value)}
              error={errors.date?.message}
            />
          )}
        />
        <Select
          label="Méthode de paiement"
          {...register('paymentMethod')}
          error={errors.paymentMethod?.message}
        >
          <option value="">Sélectionner</option>
          {paymentOptions.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </Select>
      </div>

      <Input label="Note" placeholder="Référence facture, client..." {...register('note')} />

      <div className="space-y-4 rounded-2xl border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Articles</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append(buildDefaultItems(products)[0])}
            disabled={disableActions}
          >
            Ajouter un article
          </Button>
        </div>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="grid gap-4 md:grid-cols-4">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  <span>Produit</span>
                  <select
                    className="h-11 rounded-2xl border border-slate-200 px-3 text-sm"
                    value={items[index]?.productId ?? ''}
                    onChange={(event) => handleProductChange(index, event.target.value)}
                    disabled={products.length === 0}
                  >
                    <option value="">Sélectionner</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} • {product.sku}
                      </option>
                    ))}
                  </select>
                  {errors.items?.[index]?.productId && (
                    <span className="text-xs text-rose-600">{errors.items?.[index]?.productId?.message}</span>
                  )}
                </label>
                <Input
                  type="number"
                  label="Quantité"
                  min={1}
                  step={1}
                  {...register(`items.${index}.qty`, { valueAsNumber: true })}
                  error={errors.items?.[index]?.qty?.message}
                />
                <Input
                  type="number"
                  label="Prix de vente"
                  min={0}
                  step="0.01"
                  {...register(`items.${index}.unitSalePrice`, { valueAsNumber: true })}
                  error={errors.items?.[index]?.unitSalePrice?.message}
                />
                <Input
                  type="number"
                  label="Coût unitaire"
                  min={0}
                  step="0.01"
                  {...register(`items.${index}.unitCostPrice`, { valueAsNumber: true })}
                  error={errors.items?.[index]?.unitCostPrice?.message}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm text-slate-500">
                <span>
                  Sous-total:{' '}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(items[index].qty * items[index].unitSalePrice)}
                  </span>
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="text-rose-600 hover:underline"
                    onClick={() => remove(index)}
                    disabled={disableActions}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Total ventes</span>
          <span className="font-semibold">{formatCurrency(totals.totalRevenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Coût</span>
          <span>{formatCurrency(totals.totalCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Profit</span>
          <span className="text-emerald-600">{formatCurrency(totals.totalProfit)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading} disabled={products.length === 0}>
          Enregistrer la vente
        </Button>
      </div>
    </form>
  );
};
