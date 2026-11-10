// app/layout.tsx
import type { NextWebVitalsMetric } from 'next/app';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Archivo, Geist, Geist_Mono } from 'next/font/google';
import Navbar from '../components/Navbar';
import NewFooter from '../components/NewFooter';
import GoogleAnalytics from '../components/GoogleAnalytics';
import SmoothScroll from '../components/SmoothScroll';
import ScrollCraftMount from '../components/ScrollCraftMount';
import { GA_TRACKING_ID } from './lib/gtag';
import { siteMetadata } from './lib/metadata';
import './globals.css';
import './chrome.css';
import './world.css';

const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', axes: ['wdth'], display: 'swap' });
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}

export const metadata: Metadata = siteMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${geist.variable} ${geistMono.variable}`}>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <a href="#main" className="lg-skip">Skip to content</a>
        <div className="sc-grain" aria-hidden="true" />
        <SmoothScroll>
          <Navbar />
          <main id="main">{children}</main>
          <NewFooter />
        </SmoothScroll>
        <ScrollCraftMount />
      </body>
    </html>
  );
}
