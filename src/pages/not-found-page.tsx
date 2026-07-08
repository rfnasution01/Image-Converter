import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/shared/components/empty-state';

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <EmptyState title="404 - Halaman tidak ditemukan" description="Route yang Anda buka tidak tersedia atau sudah dipindahkan." />
      <Button asChild className="mt-4"><Link to="/">Kembali ke dashboard</Link></Button>
    </div>
  );
}
