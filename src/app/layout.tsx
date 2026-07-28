import type { Metadata } from 'next';
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { Menu, Shuffle } from 'lucide-react';
import type { PropsWithChildren } from 'react';

import { ErrorMonitoring } from '@/components/error-monitoring';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';
import { ThemeToggle } from '@/components/theme-toggle';
import { getSiteUrl } from '@/lib/site';
import { AppQueryProvider } from '@/providers/query-provider';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import '@/index.css';

const siteUrl = getSiteUrl();

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'PixConvertly',
  manifest: '/favicon/site.webmanifest',
  title: {
    default: 'PixConvertly - Free Private Image Converter Online',
    template: '%s | PixConvertly',
  },
  description: 'PixConvertly is a free online image converter for JPG, PNG, WebP, AVIF, and HEIC/HEIF. Convert images privately in your browser with batch ZIP export.',
  keywords: ['PixConvertly', 'free image converter', 'online image converter', 'jpg to png converter', 'png to webp converter', 'webp to jpg converter', 'batch image converter', 'private image converter', 'browser image converter', 'convert images online'],
  authors: [{ name: 'PixConvertly' }],
  creator: 'PixConvertly',
  publisher: 'PixConvertly',
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'PixConvertly - Free Private Image Converter Online',
    description: 'Convert JPG, PNG, WebP, AVIF, and HEIC/HEIF images online with private browser-based processing and batch ZIP downloads.',
    url: '/',
    siteName: 'PixConvertly',
    locale: 'en_US',
    type: 'website',
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
    title: 'PixConvertly - Free Private Image Converter Online',
    description: 'Free online image converter for JPG, PNG, WebP, AVIF, and HEIC/HEIF with private local processing.',
    images: ['/favicon/logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon/favicon.ico'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${interTight.variable} ${jetBrainsMono.variable}`}>
        <AppQueryProvider>
          <ErrorMonitoring />
          <div className="min-h-screen bg-background font-sans text-foreground">
            <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/20 bg-background/95 backdrop-blur-sm">
              <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3" aria-label="PixConvertly home">
                  <span className="grid size-9 place-items-center border border-foreground bg-foreground text-background"><Shuffle className="size-4" strokeWidth={2.5} /></span>
                  <span className="font-heading text-lg font-black uppercase tracking-[-0.02em] text-foreground">PixConvertly</span>
                </Link>

                <nav className="hidden items-center gap-8 font-mono text-xs font-bold uppercase tracking-wide text-foreground md:flex" aria-label="Main navigation">
                  <a href="/#converter" className="transition hover:text-primary">Converter</a>
                  <a href="/#how-it-works" className="transition hover:text-primary">How it works</a>
                  <a href="/#conversion-tools" className="transition hover:text-primary">Tools</a>
                  <Link href="/privacy-policy" className="transition hover:text-primary">Privacy</Link>
                  <Link href="/donate" className="transition hover:text-primary">Donate</Link>
                </nav>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:block"><PwaInstallPrompt showTrigger /></div>
                  <ThemeToggle />
                  <Link href="/donate" className="hidden border border-foreground bg-foreground px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-background transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex">
                    Donate
                  </Link>
                  <details className="group relative md:hidden">
                    <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open navigation menu">
                      <Menu className="size-5" />
                    </summary>
                    <nav className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl" aria-label="Mobile navigation">
                      <a href="/#converter" className="block rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-muted">Converter</a>
                      <a href="/#how-it-works" className="block rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-muted">How it works</a>
                      <a href="/#conversion-tools" className="block rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-muted">Tools</a>
                      <Link href="/privacy-policy" className="block rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-muted">Privacy</Link>
                      <Link href="/donate" className="block rounded-lg px-3 py-2.5 text-sm font-bold text-primary hover:bg-muted">Donate</Link>
                    </nav>
                  </details>
                </div>
              </div>
            </header>

            <main className="pt-16">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </AppQueryProvider>
      </body>
    </html>
  );
}
