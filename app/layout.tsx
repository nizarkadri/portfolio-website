// app/layout.tsx

import type { NextWebVitalsMetric } from 'next/app';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import NewFooter from '../components/NewFooter';
import GlobalResumeButton from '../components/GlobalResumeButton';
import GoogleAnalytics from '../components/GoogleAnalytics';
import { GA_TRACKING_ID } from './lib/gtag';
import { siteMetadata } from './lib/metadata';
import './globals.css';
import { Inter } from 'next/font/google';
import SmoothScroll from '../components/SmoothScroll';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

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

// Import metadata from separate configuration file
export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* All your head tags are correct and should remain */}
        {/* ... */}
      </head>
      <body className="bg-black text-white overflow-x-hidden">
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>

        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
          <NewFooter />
        </SmoothScroll>
        <GlobalResumeButton />
      </body>
    </html>
  );
}