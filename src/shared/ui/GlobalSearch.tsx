import { DialogHTMLAttributes } from 'react';

interface GlobalSearchProps extends DialogHTMLAttributes<HTMLDialogElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} transition`}
    >
      <div className="absolute inset-0 bg-black/20" onClick={() => onOpenChange(false)} />
      <div className="relative mx-auto mt-20 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Recherche globale</p>
            <p className="text-xs text-slate-500">Tapez pour rechercher produits, ventes, statuts…</p>
          </div>
          <input
            autoFocus
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Ex: SKU-1002, vente #123, statut Disponible"
          />
          <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
            L’indexation temps-réel sera branchée dans l’itération suivante.
          </div>
          <button
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
