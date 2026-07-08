import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FieldShellProps = {
  id?: string;
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function FieldShell({ id, label, error, hint, className, children }: FieldShellProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
