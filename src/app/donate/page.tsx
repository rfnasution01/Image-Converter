import type { Metadata } from 'next';

import { DonatePage } from '@/screens/donate-page';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support PixConvertly with crypto donations or USD donations via PayPal.',
  alternates: {
    canonical: '/donate',
  },
  openGraph: {
    title: 'Donate to PixConvertly',
    description: 'Support PixConvertly with crypto donations or USD donations via PayPal.',
    url: '/donate',
    images: [
      {
        url: '/favicon/pixconvertly-logo.svg',
        width: 292,
        height: 315,
        alt: 'PixConvertly logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Donate to PixConvertly',
    description: 'Support PixConvertly with crypto or PayPal.',
    images: ['/favicon/pixconvertly-logo.svg']
  },
};

export default function Page() {
  return <DonatePage />;
}
