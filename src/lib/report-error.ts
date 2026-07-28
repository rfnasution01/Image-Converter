type ClientErrorReport = {
  message: string;
  stack?: string;
  context?: string;
  path: string;
};

export function reportClientError(error: unknown, context?: string) {
  const endpoint = process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT?.trim();
  if (!endpoint || typeof window === 'undefined') return;

  const normalizedError = error instanceof Error ? error : new Error(String(error));
  const report: ClientErrorReport = {
    message: normalizedError.message.slice(0, 1000),
    stack: normalizedError.stack?.slice(0, 5000),
    context: context?.slice(0, 1000),
    path: window.location.pathname,
  };

  const payload = JSON.stringify(report);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
    return;
  }

  void fetch(endpoint, {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => undefined);
}
