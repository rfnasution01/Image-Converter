import type { Metadata } from 'next';

import { ConverterLandingPage } from '@/screens/converter-landing-page';

export const metadata: Metadata = {
  title: 'Free JPG to PNG Converter',
  description: 'Convert JPG to PNG online in your browser with FileFlow. Private local processing, batch conversion, resize options, and ZIP download.',
  alternates: { canonical: '/jpg-to-png' },
};

export default function JpgToPngPage() {
  return (
    <ConverterLandingPage
      eyebrow="JPG to PNG converter"
      title="Free JPG to PNG converter"
      description="Turn JPG images into PNG files directly in your browser. FileFlow is ideal when you need PNG output for design workflows, screenshots, or image archives without uploading files."
      useCases={['Create PNG copies from JPG photos.', 'Batch convert JPG images for design handoff.', 'Resize images before downloading PNG files.']}
      steps={['Upload one or more JPG images.', 'Choose PNG as the output format.', 'Download a single PNG or export everything as a ZIP.']}
    />
  );
}
