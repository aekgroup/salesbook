export const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Rapports & Export</h1>
            <p className="text-sm text-slate-500">Générez des rapports de ventes et d’inventaire filtrés.</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
              Export CSV
            </button>
            <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Export JSON
            </button>
          </div>
        </div>
      </header>
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-slate-500">
        Les filtres avancés et exports imprimables seront développés à l’étape suivante.
      </div>
    </div>
  );
};
