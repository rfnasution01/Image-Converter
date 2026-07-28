import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Database, FileImage, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the PixConvertly Privacy Policy, including how private browser-based image conversion works and what limited data may be processed.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | PixConvertly',
    description: 'PixConvertly converts images locally in your browser. Learn what data is processed, stored, or shared.',
    url: '/privacy-policy',
  },
};

const lastUpdated = '13 July 2026';

const sections = [
  { id: 'overview', title: '1. Overview' },
  { id: 'data-we-process', title: '2. Information We Process' },
  { id: 'how-we-use-data', title: '3. How We Use Information' },
  { id: 'local-processing', title: '4. Local Image Processing' },
  { id: 'storage', title: '5. Storage, Cookies, and Local Data' },
  { id: 'sharing', title: '6. Sharing with Third Parties' },
  { id: 'security', title: '7. Security' },
  { id: 'retention', title: '8. Data Retention' },
  { id: 'your-rights', title: '9. Your Rights' },
  { id: 'children', title: '10. Children’s Privacy' },
  { id: 'changes', title: '11. Changes to This Policy' },
  { id: 'contact', title: '12. Contact' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(99,91,255,0.18),transparent_28%)]" />
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary">
            <ArrowLeft className="size-4" /> Back to PixConvertly
          </Link>

          <div className="mt-8 rounded-[2rem] border border-border bg-card p-6 shadow-[0_30px_100px_rgba(18,18,43,0.10)] sm:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="size-4" /> Privacy Policy
            </p>
            <h1 className="mt-6 font-heading text-4xl font-black tracking-[-0.05em] text-foreground sm:text-6xl">PixConvertly Privacy Policy</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
              This Privacy Policy explains how PixConvertly handles information when you use our free online image converter for JPG, PNG, WebP, AVIF, and HEIC/HEIF files.
            </p>
            <p className="mt-4 text-sm font-bold text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-primary">Contents</h2>
            <nav className="mt-4 space-y-2" aria-label="Privacy policy contents">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="block rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
                <FileImage className="size-8 text-primary" />
                <h2 className="mt-4 font-black">Images stay local</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Image conversion runs in your browser. Selected files are not uploaded to PixConvertly servers.</p>
              </article>
              <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
                <Database className="size-8 text-primary" />
                <h2 className="mt-4 font-black">Minimal data</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">We do not require an account to use the converter and we do not store your converted files.</p>
              </article>
              <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
                <LockKeyhole className="size-8 text-primary" />
                <h2 className="mt-4 font-black">No selling data</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">We do not sell your personal information or your images to third parties.</p>
              </article>
            </div>

            <PolicySection id="overview" title="1. Overview">
              <p>PixConvertly is designed as a privacy-first, browser-based image conversion tool. You can use the core converter without creating an account, submitting your name, or providing an email address.</p>
              <p>By using PixConvertly, you agree to the practices described in this Privacy Policy.</p>
            </PolicySection>

            <PolicySection id="data-we-process" title="2. Information We Process">
              <ul>
                <li><strong>Images you select:</strong> processed locally by your browser for conversion, resizing, preview, and download generation.</li>
                <li><strong>Conversion settings:</strong> output format, quality, and resize options used only to generate your converted files.</li>
                <li><strong>Local preferences:</strong> theme preference, onboarding completion, and PWA prompt dismissal may be saved in your browser local storage.</li>
                <li><strong>Donation data:</strong> if you choose to donate through a third-party payment service, that provider processes the payment under its own privacy terms.</li>
                <li><strong>Technical data:</strong> hosting providers may automatically process standard server logs such as IP address, user agent, requested URL, and timestamps for security and operation.</li>
                <li><strong>Error diagnostics:</strong> when production error reporting is enabled, limited error messages, stack traces, page paths, and component context may be sent to the configured monitoring provider. Image files and conversion output are not included.</li>
              </ul>
            </PolicySection>

            <PolicySection id="how-we-use-data" title="3. How We Use Information">
              <p>We use limited information to provide and improve the service, including to:</p>
              <ul>
                <li>convert, resize, preview, and package image downloads in your browser;</li>
                <li>remember local interface preferences such as theme and onboarding state;</li>
                <li>maintain website reliability, diagnose errors, support security, and prevent abuse;</li>
                <li>respond to lawful requests where required.</li>
              </ul>
            </PolicySection>

            <PolicySection id="local-processing" title="4. Local Image Processing">
              <p>Your images are converted using browser technologies such as the Canvas API and client-side libraries. PixConvertly does not intentionally upload your selected source images or converted output images to our servers.</p>
              <p>Because processing happens on your device, performance and format support may vary by browser, operating system, and hardware. Canvas conversion usually strips many embedded metadata fields, including EXIF data, but this behavior can vary and should not be treated as a guaranteed forensic metadata removal tool.</p>
            </PolicySection>

            <PolicySection id="storage" title="5. Storage, Cookies, and Local Data">
              <p>PixConvertly may store small preferences in your browser local storage, including dark/light theme preference, whether you have completed the product tour, and whether you dismissed the PWA install prompt.</p>
              <p>These items remain on your device until you clear your browser data or reset site storage. We do not use these local preferences to identify you personally.</p>
            </PolicySection>

            <PolicySection id="sharing" title="6. Sharing with Third Parties">
              <p>We do not sell your personal information and we do not share your images with third parties. Limited technical data may be processed by infrastructure, hosting, or security providers to operate the website. Donations are handled by the payment provider you choose, and their privacy policy applies to payment information.</p>
            </PolicySection>

            <PolicySection id="security" title="7. Security">
              <p>We use reasonable technical and organizational safeguards appropriate for a browser-based web application. However, no online service can guarantee absolute security. You are responsible for using a secure device, trusted browser, and safe network when processing sensitive images.</p>
            </PolicySection>

            <PolicySection id="retention" title="8. Data Retention">
              <p>PixConvertly does not retain your selected or converted images on our servers. Local preferences remain in your browser until removed by you. Standard technical logs, if generated by hosting infrastructure, are retained only as needed for security, troubleshooting, and operational purposes.</p>
            </PolicySection>

            <PolicySection id="your-rights" title="9. Your Rights">
              <p>Depending on your location, you may have rights to access, correct, delete, or restrict processing of personal information. Because PixConvertly does not require accounts and keeps conversion local, most image-related data is controlled directly by you on your device.</p>
              <p>You can clear local preferences at any time through your browser settings.</p>
            </PolicySection>

            <PolicySection id="children" title="10. Children’s Privacy">
              <p>PixConvertly is not directed to children under 13, and we do not knowingly collect personal information from children. If you believe a child has provided personal information to us, please contact us so we can take appropriate action.</p>
            </PolicySection>

            <PolicySection id="changes" title="11. Changes to This Policy">
              <p>We may update this Privacy Policy from time to time to reflect product, legal, or security changes. The updated version will be posted on this page with a revised “Last updated” date.</p>
            </PolicySection>

            <PolicySection id="contact" title="12. Contact">
              <p>If you have questions about this Privacy Policy or PixConvertly privacy practices, contact the product owner through the official PixConvertly project or donation contact channels.</p>
            </PolicySection>
          </div>
        </div>
      </section>
    </div>
  );
}

type PolicySectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

function PolicySection({ id, title, children }: PolicySectionProps) {
  return (
    <section id={id} className="scroll-mt-28 rounded-[1.5rem] border border-border bg-card p-6 shadow-sm sm:p-7">
      <h2 className="font-heading text-2xl font-black tracking-tight text-foreground">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground [&_li]:mb-2 [&_ul]:ml-5 [&_ul]:list-disc [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
