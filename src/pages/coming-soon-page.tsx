import { Construction } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ComingSoonPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Construction className="size-5 text-primary" /> Coming soon</CardTitle>
        <CardDescription>Halaman ini sudah disiapkan, namun fiturnya masih dalam pengembangan.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Gunakan halaman ini sebagai placeholder untuk menu atau modul baru.</CardContent>
    </Card>
  );
}
