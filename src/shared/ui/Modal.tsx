import { PropsWithChildren } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ModalProps extends PropsWithChildren {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export const Modal = ({ open, onClose, title, description, size = 'md', children }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 p-4 backdrop-blur" role="dialog" aria-modal="true">
      <div className="flex min-h-full items-center justify-center">
        <div className={clsx('w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl', sizeMap[size])}>
          <div className="flex items-start justify-between gap-4">
            <div>
              {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
              {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
            <button
              className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900"
              onClick={onClose}
              aria-label="Fermer la modale"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
