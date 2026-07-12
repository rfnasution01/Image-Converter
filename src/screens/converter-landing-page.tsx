import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ConverterLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  useCases: string[];
  steps: string[];
};

export function ConverterLandingPage({ eyebrow, title, description, useCases, steps }: ConverterLandingPageProps) {
  return (
    <div className="bg-background text-foreground">
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-card px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary shadow-sm">
            <Zap className="size-4" /> {eyebrow}
          </p>
          <h1 className="mt-6 font-heading text-5xl font-black leading-tight tracking-[-0.06em] sm:text-6xl">{title}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full bg-primary px-7 font-extrabold text-primary-foreground hover:bg-primary/90">
              <Link href="/#converter">
                Start converting <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-7 font-extrabold">
              <Link href="/#faq">Read FAQ</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <article className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
            <ShieldCheck className="size-9 text-primary" />
            <h2 className="mt-5 text-xl font-black">Private by design</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Images are processed locally in your browser, so you can convert files without uploading them to a server.</p>
          </article>
          <article className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
            <CheckCircle2 className="size-9 text-primary" />
            <h2 className="mt-5 text-xl font-black">Best for</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {useCases.map((useCase) => (
                <li key={useCase}>• {useCase}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
            <Zap className="size-9 text-primary" />
            <h2 className="mt-5 text-xl font-black">How to convert</h2>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {steps.map((step, index) => (
                <li key={step}>{index + 1}. {step}</li>
              ))}
            </ol>
          </article>
        </div>
      </section>
    </div>
  );
}
