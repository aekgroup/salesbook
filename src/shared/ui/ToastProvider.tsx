import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import clsx from 'clsx';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? nanoid();
      const duration = options.duration ?? 4000;
      setToasts((prev) => [...prev, { ...options, id }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={clsx(
              'rounded-2xl border px-4 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur',
              item.variant === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
              item.variant === 'error' && 'border-rose-200 bg-rose-50 text-rose-900',
              item.variant === 'warning' && 'border-amber-200 bg-amber-50 text-amber-900',
              (!item.variant || item.variant === 'default') && 'border-slate-200 bg-white text-slate-900',
            )}
          >
            {item.title && <p className="text-sm font-semibold">{item.title}</p>}
            {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
            <button
              className="mt-2 text-xs font-medium text-slate-500 underline"
              onClick={() => item.id && dismiss(item.id)}
            >
              Fermer
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
