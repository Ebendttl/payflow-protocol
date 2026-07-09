import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export default function Button({
  children,
  className,
  variant = 'primary',
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        // Primary variant (strictly flat primary teal)
        variant === 'primary' &&
          'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20',
        // Secondary variant (flat dark 700)
        variant === 'secondary' &&
          'bg-dark-700 hover:bg-dark-600 text-white border border-white/10',
        // Danger variant (rose)
        variant === 'danger' &&
          'bg-accent-rose hover:opacity-90 text-white shadow-lg shadow-accent-rose/20',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
