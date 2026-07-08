import type { ReactNode } from 'react';
import Select, { type Props as ReactSelectProps } from 'react-select';

import { cn } from '@/lib/utils';

import { FieldShell } from './field-shell';

export type SelectOption = { label: string; value: string };

type SelectInputProps<Option = SelectOption, IsMulti extends boolean = false> = ReactSelectProps<Option, IsMulti> & {
  id?: string;
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
};

export function SelectInput<Option = SelectOption, IsMulti extends boolean = false>({
  id,
  label,
  error,
  hint,
  prefix,
  suffix,
  wrapperClassName,
  className,
  ...props
}: SelectInputProps<Option, IsMulti>) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className="flex items-center gap-2">
        {prefix ? <span className="text-sm text-muted-foreground">{prefix}</span> : null}
        <Select
          inputId={id}
          unstyled
          className={cn('min-w-0 flex-1', className)}
          classNames={{
            control: (state) => cn('min-h-10 rounded-md border border-input bg-background px-3 py-1 text-sm', state.isFocused && 'ring-2 ring-ring'),
            menu: () => 'z-50 mt-1 overflow-hidden rounded-md border bg-card text-card-foreground shadow-md',
            option: (state) => cn('cursor-pointer px-3 py-2 text-sm', state.isFocused && 'bg-accent', state.isSelected && 'bg-primary text-primary-foreground'),
            placeholder: () => 'text-muted-foreground',
          }}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </FieldShell>
  );
}
