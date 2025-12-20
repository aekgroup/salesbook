export const PageLoader = () => {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="text-sm font-medium text-slate-500">Chargement de Stock &amp; Sales…</p>
      </div>
    </div>
  );
};
