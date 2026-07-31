import Link from 'next/link';
import { Check, FileDown, LockKeyhole, MousePointerClick, Upload } from 'lucide-react';

import { ConverterWorkbench } from '@/features/converter/components/converter-workbench';

const steps = [
  { icon: Upload, title: 'Choose your images', description: 'Select or drop up to 20 JPG, PNG, WebP, or HEIC files.' },
  { icon: MousePointerClick, title: 'Pick a format', description: 'Choose JPG, PNG, WebP, or AVIF. The recommended settings work for most people.' },
  { icon: FileDown, title: 'Download', description: 'Save one image directly or download a batch as a ZIP file.' },
];

const faqs = [
  { question: 'Are my images uploaded anywhere?', answer: 'No. Conversion happens locally in your browser, so your images never leave your device.' },
  { question: 'Which formats are supported?', answer: 'You can upload JPG, PNG, WebP, and HEIC/HEIF images. You can export JPG, PNG, WebP, and AVIF when supported by your browser.' },
  { question: 'Can I convert several images at once?', answer: 'Yes. Add up to 20 images, convert them together, and download the results as one ZIP file.' },
  { question: 'Will image quality change?', answer: 'PNG is lossless. For JPG, WebP, and AVIF, the default quality is designed to look excellent while reducing file size. You can adjust it in Advanced settings.' },
  { question: 'Is metadata removed?', answer: 'Browser conversion usually removes most embedded metadata, including many EXIF fields. This can vary by browser and is not a forensic metadata-removal guarantee.' },
];

export function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <section className="px-4 pb-10 pt-16 text-center sm:px-6 sm:pb-14 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-2 text-sm font-semibold text-primary">
            <LockKeyhole className="size-4" /> Private, on-device conversion
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl font-heading text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-6xl">
            Convert images without the confusion
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A simple image converter that works in your browser. No uploads, no account, no watermark.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {['Free to use', 'Batch conversion', 'Your files stay private'].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5"><Check className="size-4 text-accent" />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <ConverterWorkbench />

      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">HOW IT WORKS</p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Done in three simple steps</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><step.icon className="size-5" /></span>
                  <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="conversion-tools" className="border-y border-border bg-secondary/45 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-primary">ONE TOOL, EVERYDAY FORMATS</p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">The right format for wherever your image is going</h2>
              <p className="mt-4 leading-7 text-muted-foreground">Use WebP for smaller website images, PNG for transparency, or JPG for broad compatibility.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['JPG → PNG', 'For transparency and editing'],
                ['PNG → WebP', 'For faster websites'],
                ['WebP → JPG', 'For wider compatibility'],
                ['HEIC → JPG', 'For easy sharing'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">FAQ</p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Good to know</h2>
          </div>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {faq.question}<span aria-hidden="true" className="text-xl font-light text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pb-5 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-heading text-lg font-bold">PixConvertly</p>
            <p className="mt-1 text-sm text-muted-foreground">Simple, private image conversion in your browser.</p>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/privacy-policy" className="transition hover:text-foreground">Privacy</Link>
            <Link href="/donate" className="transition hover:text-foreground">Support us</Link>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
