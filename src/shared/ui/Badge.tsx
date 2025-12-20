import clsx from 'clsx';

const variants = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
  info: 'bg-sky-100 text-sky-800',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: keyof typeof variants;
}

export const Badge = ({ children, variant = 'default', className, ...props }: BadgeProps) => {
  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
