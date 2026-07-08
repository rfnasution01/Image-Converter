import type { Metadata } from 'next';

import { HomePage } from '@/screens/home-page';

export const metadata: Metadata = {
  title: 'Free JPG, PNG, and WebP Image Converter',
  description: 'Convert JPG to PNG, PNG to WebP, and batch export converted images as ZIP directly in your browser. Private, fast, and free.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Free JPG, PNG, and WebP Image Converter',
    description: 'Private browser-based image conversion for JPG, PNG, and WebP with batch ZIP export.',
    url: '/',
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
    title: 'Free JPG, PNG, and WebP Image Converter',
    description: 'Convert JPG, PNG, and WebP images privately in your browser.',
    images: ['/favicon/logo.png'],
  },
};

export default function Page() {
  return <HomePage />;
}
