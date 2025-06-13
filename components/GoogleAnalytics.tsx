'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Your Google Analytics Tracking ID from environment variables
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Sends a pageview event to Google Analytics.
 * This function calls `window.gtag` directly, ensuring it uses the
 * globally defined types from `gtag.ts` for full type safety.
 */
const pageview = (url: string) => {
  // Ensure the gtag function is available before calling it
  if (GA_TRACKING_ID && typeof window.gtag === 'function') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // This effect hook handles sending a pageview on initial load and every route change.
  useEffect(() => {
    // Construct the full URL, including search parameters
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    pageview(url);
  }, [pathname, searchParams]);

  // If the tracking ID is not set, render nothing.
  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      {/* The main Google Analytics script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      {/* The inline script that initializes gtag and sends the initial pageview */}
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}