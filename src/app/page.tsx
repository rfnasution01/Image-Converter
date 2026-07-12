import type { Metadata } from 'next';

import { HomePage } from '@/screens/home-page';

export const metadata: Metadata = {
  title: 'Free Online Image Converter for JPG, PNG, WebP, AVIF, and HEIC',
  description: 'Use PixConvertly to convert JPG to PNG, PNG to WebP, WebP to JPG, HEIC to JPG, and batch export converted images as ZIP. Private, fast, and free.',
  keywords: ['free online image converter', 'JPG to PNG converter', 'PNG to WebP converter', 'WebP to JPG converter', 'HEIC to JPG converter', 'AVIF converter', 'batch image converter', 'private image converter'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PixConvertly Free Online Image Converter',
    description: 'Convert JPG, PNG, WebP, AVIF, and HEIC/HEIF images privately in your browser with batch ZIP export.',
    url: '/',
    images: [
      {
        url: '/favicon/logo.png',
        width: 292,
        height: 315,
        alt: 'PixConvertly logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixConvertly Free Online Image Converter',
    description: 'Convert JPG, PNG, WebP, AVIF, and HEIC/HEIF images privately in your browser.',
    images: ['/favicon/logo.png'],
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const faqStructuredData = [
  {
    '@type': 'Question',
    name: 'Can I use PixConvertly as a JPG to PNG converter?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. Upload one or more JPG images, choose PNG as the output format, and download the converted PNG files individually or as a ZIP.',
    },
  },
  {
    '@type': 'Question',
    name: 'Can PixConvertly convert PNG to WebP for smaller website images?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. Choose WebP output, adjust quality if needed, and PixConvertly will convert PNG files locally in your browser for lighter web-friendly images.',
    },
  },
  {
    '@type': 'Question',
    name: 'Can I convert WebP to JPG?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. PixConvertly supports WebP to JPG conversion for compatibility with tools, forms, and platforms that do not accept WebP files.',
    },
  },
  {
    '@type': 'Question',
    name: 'Are my files uploaded?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'No. PixConvertly converts images locally in your browser with the Canvas API, so selected files are not uploaded to our server.',
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
    name: 'PixConvertly Image Converter',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    url: siteUrl,
    description: 'Free online image converter for JPG, PNG, WebP, AVIF, and HEIC/HEIF with private browser-based processing, resize, quality controls, and batch ZIP export.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: ['JPG to PNG converter', 'PNG to WebP converter', 'WebP to JPG converter', 'HEIC to JPG converter', 'AVIF converter', 'Batch image converter', 'Local browser processing', 'ZIP export'],
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
