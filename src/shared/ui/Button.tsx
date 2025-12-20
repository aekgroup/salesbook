import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const variants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-600',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
} as const;

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-10 w-10',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', loading = false, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
