import { forwardRef, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label && <span>{label}</span>}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'min-h-[96px] rounded-2xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400',
            'focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-100',
            className,
          )}
          {...props}
        />
        {error ? (
          <span className="text-xs text-rose-600">{error}</span>
        ) : (
          hint && <span className="text-xs font-normal text-slate-400">{hint}</span>
        )}
      </label>
    );
  },
);

Textarea.displayName = 'Textarea';
