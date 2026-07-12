import type { Metadata } from 'next';

import { HomePage } from '@/screens/home-page';

export const metadata: Metadata = {
  title: 'Free JPG to PNG, PNG to WebP, and WebP to JPG Converter',
  description: 'Convert JPG to PNG, PNG to WebP, WebP to JPG, and batch export converted images as ZIP directly in your browser. Private, fast, and free.',
  keywords: ['JPG to PNG converter', 'PNG to WebP converter', 'WebP to JPG converter', 'batch image converter', 'private image converter'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Free JPG to PNG, PNG to WebP, and WebP to JPG Converter',
    description: 'Private browser-based image conversion for JPG, PNG, WebP, HEIC/HEIF, and batch ZIP export.',
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
    title: 'Free JPG to PNG, PNG to WebP, and WebP to JPG Converter',
    description: 'Convert JPG, PNG, and WebP images privately in your browser.',
    images: ['/favicon/logo.png'],
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const faqStructuredData = [
  {
    '@type': 'Question',
    name: 'Can I use FileFlow as a JPG to PNG converter?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. Upload one or more JPG images, choose PNG as the output format, and download the converted PNG files individually or as a ZIP.',
    },
  },
  {
    '@type': 'Question',
    name: 'Can FileFlow convert PNG to WebP for smaller website images?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. Choose WebP output, adjust quality if needed, and FileFlow will convert PNG files locally in your browser for lighter web-friendly images.',
    },
  },
  {
    '@type': 'Question',
    name: 'Can I convert WebP to JPG?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. FileFlow supports WebP to JPG conversion for compatibility with tools, forms, and platforms that do not accept WebP files.',
    },
  },
  {
    '@type': 'Question',
    name: 'Are my files uploaded?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'No. FileFlow converts images locally in your browser with the Canvas API, so selected files are not uploaded to our server.',
    },
  },
  {
    '@type': 'Question',
    name: 'Is image metadata removed?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Canvas conversion usually strips most embedded metadata, including many EXIF fields. Browser behavior can vary, so avoid treating it as a guaranteed forensic metadata cleaner.',
    },
  },
  {
    '@type': 'Question',
    name: 'Which formats are supported?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'You can upload JPG, PNG, WebP, or HEIC/HEIF images and export them as JPG, PNG, WebP, or AVIF when your browser supports AVIF encoding. Batch downloads are packaged as a ZIP file.',
    },
  },
];

const structuredData: Record<string, unknown>[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FileFlow Image Converter',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    url: siteUrl,
    description: 'Private browser-based JPG to PNG, PNG to WebP, WebP to JPG, and batch image converter with resize, quality, and ZIP export.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: ['JPG to PNG converter', 'PNG to WebP converter', 'WebP to JPG converter', 'Batch image converter', 'Local browser processing', 'ZIP export'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqStructuredData,
  },
];

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HomePage />
    </>
  );
}
