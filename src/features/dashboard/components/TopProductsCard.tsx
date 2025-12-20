import { formatCurrency } from '../../../shared/utils/format';

interface TopProduct {
  productId: string;
  name: string;
  qty: number;
  profit: number;
}

interface TopProductsCardProps {
  products: TopProduct[];
}

export const TopProductsCard = ({ products }: TopProductsCardProps) => {
  const maxProfit = products.reduce((acc, product) => Math.max(acc, product.profit), 0);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Top produits</p>
          <p className="text-xl font-semibold text-slate-900">Profit par article</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Top 5</span>
      </div>
      {products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          Les ventes accumulées alimenteront ce classement.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {products.map((product) => {
            const progress = maxProfit === 0 ? 0 : (product.profit / maxProfit) * 100;
            return (
              <div key={product.productId} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.qty} unités vendues</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(product.profit)}</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
