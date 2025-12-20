import { forwardRef, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className, children, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label && <span>{label}</span>}
        <select
          ref={ref}
          id={inputId}
          className={clsx(
            'h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition',
            'focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-100',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <span className="text-xs text-rose-600">{error}</span>
        ) : (
          hint && <span className="text-xs font-normal text-slate-400">{hint}</span>
        )}
      </label>
    );
  },
);

Select.displayName = 'Select';
