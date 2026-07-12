import type { Metadata } from 'next';

import { ConverterLandingPage } from '@/screens/converter-landing-page';

export const metadata: Metadata = {
  title: 'Free WebP to JPG Converter Online',
  description: 'Convert WebP to JPG online for free with PixConvertly. Private local conversion with batch support, resize controls, quality settings, and ZIP export.',
  keywords: ['WebP to JPG converter', 'convert WebP to JPG online', 'free JPG converter', 'batch WebP to JPG'],
  alternates: { canonical: '/webp-to-jpg' },
};

export default function WebpToJpgPage() {
  return (
    <ConverterLandingPage
      eyebrow="WebP to JPG converter"
      title="Free WebP to JPG converter"
      description="Need a JPG copy of a WebP image? Convert WebP to JPG locally in your browser for compatibility with older tools, forms, and platforms."
      useCases={['Create JPG versions of WebP images.', 'Prepare images for apps that do not accept WebP.', 'Batch convert and download JPG files in one ZIP.']}
      steps={['Upload WebP images.', 'Choose JPG and set quality if needed.', 'Download one JPG or a ZIP for the batch.']}
    />
  );
}
