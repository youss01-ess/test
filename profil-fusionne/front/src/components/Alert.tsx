import type { ReactNode } from 'react';

type AlertProps = {
  variant: 'error' | 'success';
  children: ReactNode;
};

const styles: Record<AlertProps['variant'], string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

export default function Alert({ variant, children }: AlertProps) {
  return (
    <div
      className={`rounded-lg border p-3 text-sm ${styles[variant]}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}