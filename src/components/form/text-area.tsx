import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';

import { Textarea } from '@/components/ui/textarea';

import { FieldShell } from './field-shell';

type TextAreaInputProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  wrapperClassName?: string;
};

export const TextAreaInput = forwardRef<HTMLTextAreaElement, TextAreaInputProps>(
  ({ id, label, error, hint, wrapperClassName, ...props }, ref) => (
    <FieldShell id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <Textarea ref={ref} id={id} aria-invalid={Boolean(error)} {...props} />
    </FieldShell>
  ),
);
TextAreaInput.displayName = 'TextAreaInput';
