'use client';

import { useEffect } from 'react';

import { reportClientError } from '@/lib/report-error';

export function ErrorMonitoring() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportClientError(event.error ?? event.message, 'window.error');
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      reportClientError(event.reason, 'window.unhandledrejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
