import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { TextInput } from './text-input';

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
};

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>((props, ref) => <TextInput ref={ref} type="date" {...props} />);
DateInput.displayName = 'DateInput';
