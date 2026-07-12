import type { Metadata } from 'next';

import { ConverterLandingPage } from '@/screens/converter-landing-page';

export const metadata: Metadata = {
  title: 'Free PNG to WebP Converter Online',
  description: 'Convert PNG to WebP online for free with PixConvertly. Reduce image size with private browser-based processing, quality control, resize, and batch ZIP downloads.',
  keywords: ['PNG to WebP converter', 'convert PNG to WebP online', 'free WebP converter', 'optimize PNG to WebP'],
  alternates: { canonical: '/png-to-webp' },
};

export default function PngToWebpPage() {
  return (
    <ConverterLandingPage
      eyebrow="PNG to WebP converter"
      title="Free PNG to WebP converter"
      description="Convert PNG images to WebP for faster web pages and lighter downloads. PixConvertly lets you control quality and dimensions while keeping files on your device."
      useCases={['Optimize PNG assets for websites.', 'Reduce file size with WebP quality control.', 'Batch export converted WebP files as a ZIP.']}
      steps={['Upload PNG images from your device.', 'Choose WebP and adjust quality if needed.', 'Download converted WebP images privately.']}
    />
  );
}
