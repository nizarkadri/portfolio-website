'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Google Analytics tracking ID
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Define proper types for gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Google Analytics functions
export const gtag = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

export const pageview = (url: string) => {
  gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Performance monitoring with proper typing
interface WebVitalMetric {
  name: string;
  id: string;
  value: number;
}

export const reportWebVitals = (metric: WebVitalMetric) => {
  if (GA_TRACKING_ID) {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
};

// Analytics component
const Analytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (GA_TRACKING_ID && isClient) {
      const url = pathname + searchParams.toString();
      pageview(url);
    }
  }, [pathname, searchParams, isClient]);

  useEffect(() => {
    if (!isClient) return;

    // Track performance metrics using modern Performance API
    if ('performance' in window) {
      // Track page load time using modern API
      const handleLoad = () => {
        // Use performance.now() and performance.getEntriesByType for modern approach
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0];
          const loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
          
          if (loadTime > 0) {
            event({
              action: 'page_load_time',
              category: 'Performance',
              value: Math.round(loadTime),
            });
          }
        }
      };

      // Track time to first byte using PerformanceObserver
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            
            if (ttfb > 0) {
              event({
                action: 'ttfb',
                category: 'Performance',
                value: Math.round(ttfb),
              });
            }
          }
        }
      });

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
      }

      observer.observe({ entryTypes: ['navigation'] });

      return () => {
        window.removeEventListener('load', handleLoad);
        observer.disconnect();
      };
    }
  }, [isClient]);

  // Only render on client side and when GA_TRACKING_ID is available
  if (!isClient || !GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
    </>
  );
};

export default Analytics; 