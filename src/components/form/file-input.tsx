import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { FieldShell } from './field-shell';

type FileInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
};

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ id, label, error, hint, prefix, suffix, className, wrapperClassName, ...props }, ref) => (
    <FieldShell id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className="relative flex items-center gap-2">
        {prefix ? <span className="text-sm text-muted-foreground">{prefix}</span> : null}
        <Input ref={ref} id={id} type="file" className={cn('cursor-pointer', className)} aria-invalid={Boolean(error)} {...props} />
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </FieldShell>
  ),
);
FileInput.displayName = 'FileInput';
