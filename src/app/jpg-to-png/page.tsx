import type { Metadata } from 'next';

import { ConverterLandingPage } from '@/screens/converter-landing-page';

export const metadata: Metadata = {
  title: 'Free JPG to PNG Converter Online',
  description: 'Convert JPG to PNG online for free with PixConvertly. Private local processing, batch conversion, resize options, and ZIP download.',
  keywords: ['JPG to PNG converter', 'convert JPG to PNG online', 'free JPG converter', 'batch JPG to PNG'],
  alternates: { canonical: '/jpg-to-png' },
};

export default function JpgToPngPage() {
  return (
    <ConverterLandingPage
      eyebrow="JPG to PNG converter"
      title="Free JPG to PNG converter"
      description="Turn JPG images into PNG files directly in your browser. PixConvertly is ideal when you need PNG output for design workflows, screenshots, or image archives without uploading files."
      useCases={['Create PNG copies from JPG photos.', 'Batch convert JPG images for design handoff.', 'Resize images before downloading PNG files.']}
      steps={['Upload one or more JPG images.', 'Choose PNG as the output format.', 'Download a single PNG or export everything as a ZIP.']}
    />
  );
}
