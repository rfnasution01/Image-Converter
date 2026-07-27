import Link from 'next/link';

import { ConverterWorkbench } from '@/features/converter/components/converter-workbench';

const steps = [
  { title: 'Upload images', description: 'Drop JPG, PNG, WebP, or HEIC/HEIF files into the upload area.' },
  { title: 'Choose format', description: 'Select one output format for all uploaded images.' },
  { title: 'Convert & download', description: 'Start the conversion, then download one image or a ZIP for multiple files.' },
];

const faqs = [
  {
    question: 'Can I use PixConvertly as a JPG to PNG converter?',
    answer: 'Yes. Upload one or more JPG images, choose PNG as the output format, and download the converted PNG files individually or as a ZIP.',
  },
  {
    question: 'Can PixConvertly convert PNG to WebP for smaller website images?',
    answer: 'Yes. Choose WebP output, adjust quality if needed, and PixConvertly will convert PNG files locally in your browser for lighter web-friendly images.',
  },
  {
    question: 'Can I convert WebP to JPG?',
    answer: 'Yes. PixConvertly supports WebP to JPG conversion for compatibility with tools, forms, and platforms that do not accept WebP files.',
  },
  {
    question: 'Are my files uploaded?',
    answer: 'No. PixConvertly converts images locally in your browser with the Canvas API, so selected files are not uploaded to our server.',
  },
  {
    question: 'Is image metadata removed?',
    answer: 'Canvas conversion usually strips most embedded metadata, including many EXIF fields. Browser behavior can vary, so avoid treating it as a guaranteed forensic metadata cleaner.',
  },
  {
    question: 'Which formats are supported?',
    answer: 'You can upload JPG, PNG, WebP, or HEIC/HEIF images and export them as JPG, PNG, WebP, or AVIF when your browser supports AVIF encoding. Batch downloads are packaged as a ZIP file.',
  },
];

export function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-foreground/20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-12">
          <aside className="border-l-2 border-primary pl-4">
            <p className="technical-label text-primary">Utility 001</p>
            <p className="mt-2 font-mono text-xs leading-5 text-muted-foreground">Browser-native<br />Image processor</p>
          </aside>
          <div>
            <p className="technical-label text-muted-foreground">No cloud · No account · No trace</p>
            <h1 className="mt-5 max-w-4xl font-heading text-5xl font-black leading-[0.93] tracking-[-0.06em] sm:text-6xl lg:text-[5.25rem]">
              Your images.<br /><span className="text-primary">Your machine.</span>
            </h1>
            <div className="mt-8 grid gap-6 border-t border-foreground/20 pt-5 md:grid-cols-[minmax(0,2fr)_minmax(14rem,1fr)]">
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Convert JPG, PNG, WebP, AVIF, and HEIC directly in the browser. Nothing is sent to a server.
              </p>
              <ul className="space-y-1 font-mono text-xs font-bold uppercase tracking-wide" aria-label="Product benefits">
                <li>01 / Local processing</li><li>02 / No watermark</li><li>03 / Batch ZIP export</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ConverterWorkbench />

      <section id="how-it-works" className="border-y border-foreground/20 bg-secondary/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-3 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-12">
            <p className="technical-label text-primary">Process</p>
            <h2 className="max-w-2xl font-heading text-4xl font-black leading-none tracking-[-0.05em] text-foreground">Three actions. No hidden upload.</h2>
          </div>
          <div className="grid border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
            {steps.map((step, index) => (
              <div key={step.title} className="border-b border-border py-7 last:border-b-0 md:border-b-0 md:px-7 md:first:pl-0 md:last:pr-0">
                <div className="font-mono text-xs font-bold text-primary">0{index + 1}</div>
                <h2 className="mt-5 font-heading text-xl font-black tracking-tight">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="conversion-tools" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-4 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-12">
            <p className="technical-label text-primary">Format index</p>
            <div>
              <h2 className="max-w-3xl font-heading text-4xl font-black leading-none tracking-[-0.05em] text-foreground">Common routes through the converter.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">One workspace for routine format changes and batch delivery—without a server in the middle.</p>
            </div>
          </div>
          <div className="grid border-t border-border md:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
            <article className="border-b border-border py-6 lg:px-5 lg:first:pl-0">
              <h3 className="text-base font-black text-foreground">JPG to PNG converter</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Create PNG copies from JPG photos for design workflows, screenshots, and archival needs.</p>
            </article>
            <article className="border-b border-border py-6 lg:px-5">
              <h3 className="text-base font-black text-foreground">PNG to WebP converter</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Optimize PNG images into WebP with quality control to help reduce website asset size.</p>
            </article>
            <article className="border-b border-border py-6 lg:px-5">
              <h3 className="text-base font-black text-foreground">WebP to JPG converter</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Convert WebP images to JPG for apps, upload forms, and platforms that need wider compatibility.</p>
            </article>
            <article className="border-b border-border py-6 lg:px-5 lg:last:pr-0">
              <h3 className="text-base font-black text-foreground">Batch image converter</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Convert multiple images at once, track progress, compare file sizes, and download everything as a ZIP.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-4 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-12">
            <p className="technical-label text-primary">Field notes</p>
            <div>
              <h2 className="max-w-2xl font-heading text-4xl font-black leading-none tracking-[-0.05em] text-foreground">Questions before you process.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Format support, privacy, metadata, and batch conversion.</p>
            </div>
          </div>
          <div className="mx-auto max-w-3xl divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-1">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-black text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {faq.question}
                  <span aria-hidden="true" className="font-mono text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pb-5 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer id="privacy" className="border-t-4 border-primary bg-foreground px-4 py-14 text-background sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h2 className="font-heading text-3xl font-black tracking-tight">PixConvertly</h2>
              <p className="mt-4 leading-7 text-background/60">A free, private online image converter for JPG, PNG, WebP, AVIF, and HEIC/HEIF files.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold">Available tools</h2>
              <ul className="mt-4 space-y-3 text-background/60">
                <li>JPG to PNG/WebP/AVIF</li>
                <li>PNG to JPG/WebP/AVIF</li>
                <li>WebP/HEIC to JPG/PNG/WebP</li>
                <li>Batch ZIP download</li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-bold">Privacy first</h2>
              <p className="mt-4 leading-7 text-background/60">Your images are processed in your browser and never leave your device.</p>
              <p className="mt-3 leading-7 text-background/60">Conversion through canvas usually strips most embedded metadata, including many EXIF fields, without claiming guaranteed removal in every browser.</p>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-background/20 pt-7 font-mono text-xs uppercase tracking-wide text-background/60">
            <div>
              <p>© {new Date().getFullYear()} PixConvertly. All rights reserved.</p>
              <p className="mt-1">A product by <span className="font-bold text-background">Nasution Corp.</span></p>
            </div>
            <Link href="/privacy-policy" className="font-bold transition hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
