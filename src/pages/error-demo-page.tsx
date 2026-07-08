import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Contoh error dari komponen halaman.');
  return <p className="text-sm text-muted-foreground">Klik tombol untuk menguji ErrorBoundary.</p>;
}

export function ErrorDemoPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Boundary Demo</CardTitle>
        <CardDescription>Halaman penting untuk menguji fallback jika komponen mengalami error.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Bomb shouldThrow={shouldThrow} />
        <Button type="button" variant="destructive" onClick={() => setShouldThrow(true)}>Trigger error</Button>
      </CardContent>
    </Card>
  );
}
