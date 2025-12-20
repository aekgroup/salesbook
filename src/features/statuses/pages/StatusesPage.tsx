export const StatusesPage = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Statuts personnalisés</h1>
            <p className="text-sm text-slate-500">Définissez et réorganisez les statuts produits.</p>
          </div>
          <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Nouveau statut
          </button>
        </div>
      </header>
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-slate-500">
        La gestion détaillée (drag & drop, défaut, couleur) sera ajoutée prochainement.
      </div>
    </div>
  );
};
