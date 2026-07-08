import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { FieldShell } from './field-shell';

type CheckboxInputProps = Omit<ComponentPropsWithoutRef<typeof Checkbox>, 'prefix'> & {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
};

export function CheckboxInput({ id, label, error, hint, prefix, suffix, wrapperClassName, ...props }: CheckboxInputProps) {
  return (
    <FieldShell error={error} hint={hint} className={wrapperClassName}>
      <div className="flex items-center gap-2">
        {prefix ? <span className="text-sm text-muted-foreground">{prefix}</span> : null}
        <Checkbox id={id} aria-invalid={Boolean(error)} {...props} />
        {label ? <Label htmlFor={id}>{label}</Label> : null}
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </FieldShell>
  );
}
