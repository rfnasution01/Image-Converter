import type { Metadata } from 'next';
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { Shuffle } from 'lucide-react';
import type { PropsWithChildren } from 'react';

import { PwaInstallPrompt } from '@/components/pwa-install-prompt';
import { ThemeToggle } from '@/components/theme-toggle';
import { AppQueryProvider } from '@/providers/query-provider';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import '@/index.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'FileFlow',
  manifest: '/favicon/site.webmanifest',
  title: {
    default: 'FileFlow - Private Image Converter',
    template: '%s | FileFlow',
  },
  description: 'Convert JPG, PNG, and WebP images privately in your browser with fast batch export. No upload, no watermark, and free to use.',
  keywords: ['image converter', 'jpg to png', 'png to webp', 'webp to jpg', 'batch image converter', 'jpg converter', 'png converter', 'browser image converter', 'FileFlow'],
  authors: [{ name: 'FileFlow' }],
  creator: 'FileFlow',
  publisher: 'FileFlow',
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
    title: 'FileFlow - Private Image Converter',
    description: 'Fast, private, browser-based image conversion with batch ZIP export.',
    url: '/',
    siteName: 'FileFlow',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/favicon/logo.png',
        width: 292,
        height: 315,
        alt: 'FileFlow logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FileFlow - Private Image Converter',
    description: 'Convert images privately in your browser with fast batch ZIP export.',
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
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${interTight.variable} ${jetBrainsMono.variable}`}>
        <AppQueryProvider>
          <div className="min-h-screen bg-background font-sans text-foreground">
            <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/75 backdrop-blur-xl">
              <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3" aria-label="FileFlow home">
                  <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_35px_rgba(99,91,255,0.25)]"><Shuffle className="size-5" strokeWidth={3} /></span>
                  <span className="font-heading text-xl font-black tracking-tight text-foreground">FileFlow</span>
                </Link>

                <nav className="hidden items-center gap-9 text-[14px] font-bold text-foreground md:flex" aria-label="Main navigation">
                  <a href="/#converter" className="transition hover:text-primary">Converter</a>
                  <a href="/#how-it-works" className="transition hover:text-primary">How it works</a>
                  <a href="/#conversion-tools" className="transition hover:text-primary">Tools</a>
                  <a href="/#privacy" className="transition hover:text-primary">Privacy</a>
                  <Link href="/donate" className="transition hover:text-primary">Donate</Link>
                </nav>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Link href="/donate" className="rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-[0_14px_35px_rgba(99,91,255,0.25)] transition hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20">
                    Donate
                  </Link>
                </div>
              </div>
            </header>

            <main className="pt-20">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <PwaInstallPrompt />
          </div>
        </AppQueryProvider>
      </body>
    </html>
  );
}
