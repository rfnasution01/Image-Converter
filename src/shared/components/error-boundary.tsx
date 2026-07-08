'use client';

import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ErrorBoundaryState = { hasError: boolean; error?: Error };

type ErrorBoundaryProps = PropsWithChildren<{ fallback?: ReactNode }>;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <Card>
          <CardHeader>
            <CardTitle>Terjadi kesalahan</CardTitle>
            <CardDescription>Aplikasi mengalami error saat menampilkan halaman.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">{this.state.error?.message}</pre>
            <Button type="button" onClick={() => this.setState({ hasError: false, error: undefined })}>Coba lagi</Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
