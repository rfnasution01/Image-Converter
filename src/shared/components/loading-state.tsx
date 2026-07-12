import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type LoadingStateProps = {
  text?: string;
  className?: string;
};

export function LoadingState({ text = 'Memuat...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 rounded-xl border bg-card p-6 text-sm text-muted-foreground', className)} role="status" aria-live="polite">
      <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
      {text}
    </div>
  );
}

export function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <span className="size-2 animate-bounce rounded-full bg-primary" />
    </span>
  );
}
