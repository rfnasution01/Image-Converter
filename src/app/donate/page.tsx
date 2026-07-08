import type { Metadata } from 'next';

import { DonatePage } from '@/screens/donate-page';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support FileFlow with crypto donations or USD donations via PayPal.',
  alternates: {
    canonical: '/donate',
  },
  openGraph: {
    title: 'Donate to FileFlow',
    description: 'Support FileFlow with crypto donations or USD donations via PayPal.',
    url: '/donate',
    images: [
      {
        url: '/favicon/logo.png',
        width: 292,
        height: 315,
        alt: 'FileFlow logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Donate to FileFlow',
    description: 'Support FileFlow with crypto or PayPal.',
    images: ['/favicon/logo.png'],
  },
};

export default function Page() {
  return <DonatePage />;
}
