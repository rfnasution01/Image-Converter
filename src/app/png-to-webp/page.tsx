import type { Metadata } from 'next';

import { ConverterLandingPage } from '@/screens/converter-landing-page';

export const metadata: Metadata = {
  title: 'Free PNG to WebP Converter',
  description: 'Convert PNG to WebP online with private browser-based processing. Reduce image size, adjust quality, resize, and download batch ZIP files.',
  alternates: { canonical: '/png-to-webp' },
};

export default function PngToWebpPage() {
  return (
    <ConverterLandingPage
      eyebrow="PNG to WebP converter"
      title="Free PNG to WebP converter"
      description="Convert PNG images to WebP for faster web pages and lighter downloads. FileFlow lets you control quality and dimensions while keeping files on your device."
      useCases={['Optimize PNG assets for websites.', 'Reduce file size with WebP quality control.', 'Batch export converted WebP files as a ZIP.']}
      steps={['Upload PNG images from your device.', 'Choose WebP and adjust quality if needed.', 'Download converted WebP images privately.']}
    />
  );
}
