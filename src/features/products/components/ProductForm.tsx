import { useEffect } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues, Status } from '../../../shared/types';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Button } from '../../../shared/ui/Button';

interface ProductFormProps {
  defaultValues?: ProductFormValues;
  statuses: Status[];
  onSubmit: SubmitHandler<ProductFormValues>;
  onCancel: () => void;
  loading?: boolean;
}

export const ProductForm = ({ defaultValues, statuses, onSubmit, onCancel, loading }: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: defaultValues ?? {
      sku: '',
      name: '',
      category: 'Général',
      brand: '',
      purchasePrice: 0,
      salePrice: 0,
      quantity: 0,
      initialStock: 0,
      statusId: statuses[0]?.id ?? '',
      reorderThreshold: 5,
    },
  });

  const watchedQuantity = watch('quantity');
  const watchedInitialStock = watch('initialStock');

  const handleSetInitialStock = () => {
    setValue('initialStock', watchedQuantity);
  };

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="SKU" {...register('sku')} error={errors.sku?.message} placeholder="SKU-2025001" autoFocus />
        <Input label="Nom" {...register('name')} error={errors.name?.message} placeholder="Galaxy Tab A9" />
        <Input label="Catégorie" {...register('category')} placeholder="Tablettes" error={errors.category?.message} />
        <Input label="Marque" {...register('brand')} placeholder="Samsung" error={errors.brand?.message} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Prix d’achat"
          type="number"
          min={0}
          step="0.01"
          {...register('purchasePrice', { valueAsNumber: true })}
          error={errors.purchasePrice?.message}
        />
        <Input
          label="Prix de vente"
          type="number"
          min={0}
          step="0.01"
          {...register('salePrice', { valueAsNumber: true })}
          error={errors.salePrice?.message}
        />
        <Input
          label="Stock initial"
          type="number"
          min={0}
          {...register('initialStock', { valueAsNumber: true })}
          error={errors.initialStock?.message}
          placeholder="Quantité initiale lors de la création"
        />
        <div className="space-y-2">
          <Input
            label="Stock actuel"
            type="number"
            min={0}
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSetInitialStock}
            className="w-full"
          >
            Définir comme stock initial
          </Button>
        </div>
        <Input
          label="Seuil d'alerte"
          type="number"
          min={0}
          {...register('reorderThreshold', { valueAsNumber: true })}
          error={errors.reorderThreshold?.message}
        />
      </div>
      <Select label="Statut" {...register('statusId')} error={errors.statusId?.message}>
        {statuses.map((status) => (
          <option key={status.id} value={status.id}>
            {status.label}
          </option>
        ))}
      </Select>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          {defaultValues ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};
