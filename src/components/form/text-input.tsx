import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { FieldShell } from './field-shell';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, error, hint, prefix, suffix, className, wrapperClassName, ...props }, ref) => (
    <FieldShell id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className="relative flex items-center">
        {prefix ? <span className="absolute left-3 text-sm text-muted-foreground">{prefix}</span> : null}
        <Input ref={ref} id={id} className={cn(prefix && 'pl-9', suffix && 'pr-9', className)} aria-invalid={Boolean(error)} {...props} />
        {suffix ? <span className="absolute right-3 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </FieldShell>
  ),
);
TextInput.displayName = 'TextInput';
