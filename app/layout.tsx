// app/layout.tsx

import type { NextWebVitalsMetric } from 'next/app';
import { Suspense } from 'react';
// import Script from 'next/script'; // No longer needed here
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import NewFooter from '../components/NewFooter';
import GlobalResumeButton from '../components/GlobalResumeButton';

// --- KEY CHANGES ---
// 1. Import the new GoogleAnalytics component
import GoogleAnalytics from '../components/GoogleAnalytics';
// 2. You can remove the old AnalyticsTracker import
// import AnalyticsTracker from '../components/AnalyticsTracker';
// 3. Keep the GA_TRACKING_ID import for reportWebVitals
import { GA_TRACKING_ID } from './lib/gtag';
// --- END OF KEY CHANGES ---

import './globals.css';
import { Inter } from 'next/font/google';
import SmoothScroll from '../components/SmoothScroll';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// This function is correct and should remain.
// It will work because GoogleAnalytics.tsx ensures window.gtag is available.
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

// Your metadata is excellent and remains unchanged.
// Just a reminder to replace placeholder values.
export const metadata: Metadata = {
  // ... all your metadata ...
  metadataBase: new URL('https://your-actual-domain.com'), // REMINDER: Update this
  // ...
};

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
        {/*
          --- KEY CHANGE ---
          The old <Script> tags and <AnalyticsTracker> have been replaced
          by the single <GoogleAnalytics /> component.
          We wrap it in Suspense because it uses client-side hooks.
        */}
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