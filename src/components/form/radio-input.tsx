import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { FieldShell } from './field-shell';

type Option = { label: ReactNode; value: string; disabled?: boolean; prefix?: ReactNode; suffix?: ReactNode };

type RadioInputProps = ComponentPropsWithoutRef<typeof RadioGroup> & {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  options: Option[];
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
};

export function RadioInput({ id, label, error, hint, options, prefix, suffix, wrapperClassName, ...props }: RadioInputProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className="flex items-start gap-2">
        {prefix ? <span className="text-sm text-muted-foreground">{prefix}</span> : null}
        <RadioGroup id={id} aria-invalid={Boolean(error)} {...props}>
          {options.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              {option.prefix}
              <RadioGroupItem id={`${id}-${option.value}`} value={option.value} disabled={option.disabled} />
              <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
              {option.suffix}
            </div>
          ))}
        </RadioGroup>
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </FieldShell>
  );
}
