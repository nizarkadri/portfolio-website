// 'use client';

// import { useEffect, useState, Suspense } from 'react';
// import { usePathname, useSearchParams } from 'next/navigation';

// // Type definitions
// interface GtagConfig {
//   page_path: string;
//   anonymize_ip?: boolean;
//   allow_google_signals?: boolean;
//   allow_ad_personalization_signals?: boolean;
// }

// interface EventParams {
//   action: string;
//   category: string;
//   label?: string;
//   value?: number;
// }

// interface WebVitalMetric {
//   name: string;
//   id: string;
//   value: number;
//   delta?: number;
//   entries?: PerformanceEntry[];
// }

// // Type definitions for gtag commands
// type GtagCommand = 'config' | 'event' | 'js';
// type GtagEventParams = Record<string, string | number | boolean | undefined>;

// interface GtagFunction {
//   (command: 'config', targetId: string, config?: GtagConfig): void;
//   (command: 'event', eventName: string, eventParams?: GtagEventParams): void;
//   (command: 'js', date: Date): void;
// }

// // Extend Window interface to include gtag
// declare global {
//   interface Window {
//     gtag: GtagFunction;
//     dataLayer: unknown[];
//   }
// }

// // Google Analytics tracking ID
// const GA_TRACKING_ID: string | undefined = process.env.NEXT_PUBLIC_GA_ID;

// // Google Analytics functions - using function overloads
// export function gtag(command: 'config', targetId: string, config?: GtagConfig): void;
// export function gtag(command: 'event', eventName: string, eventParams?: GtagEventParams): void;
// export function gtag(command: 'js', date: Date): void;
// export function gtag(
//   command: GtagCommand,
//   targetIdOrEventNameOrDate: string | Date,
//   configOrEventParams?: GtagConfig | GtagEventParams
// ): void {
//   if (typeof window !== 'undefined' && window.gtag) {
//     if (command === 'config') {
//       window.gtag('config', targetIdOrEventNameOrDate as string, configOrEventParams as GtagConfig);
//     } else if (command === 'event') {
//       window.gtag('event', targetIdOrEventNameOrDate as string, configOrEventParams as GtagEventParams);
//     } else if (command === 'js') {
//       window.gtag('js', targetIdOrEventNameOrDate as Date);
//     }
//   }
// }

// export const pageview = (url: string): void => {
//   if (!GA_TRACKING_ID) return;
  
//   gtag('config', GA_TRACKING_ID, {
//     page_path: url,
//   });
// };

// export const event = ({
//   action,
//   category,
//   label,
//   value,
// }: EventParams): void => {
//   if (!GA_TRACKING_ID) return;
  
//   gtag('event', action, {
//     event_category: category,
//     event_label: label,
//     value: value,
//   });
// };

// // Performance monitoring
// export const reportWebVitals = (metric: WebVitalMetric): void => {
//   if (!GA_TRACKING_ID) return;
  
//   gtag('event', metric.name, {
//     event_category: 'Web Vitals',
//     event_label: metric.id,
//     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
//     non_interaction: true,
//   });
// };

// // Analytics component
// const AnalyticsInner: React.FC = () => {
//   const pathname: string = usePathname();
//   const searchParams = useSearchParams();
//   const [isClient, setIsClient] = useState(false);

//   // Ensure we only render on client side after hydration
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     if (GA_TRACKING_ID && isClient) {
//       const searchString: string = searchParams.toString();
//       const url: string = pathname + (searchString ? `?${searchString}` : '');
//       pageview(url);
//     }
//   }, [pathname, searchParams, isClient]);

//   useEffect(() => {
//     if (!isClient) return;
    
//     // Track performance metrics
//     if ('performance' in window) {
//       // Track page load time
//       const handleLoad = (): void => {
//         const timing = performance.timing;
//         const loadTime: number = timing.loadEventEnd - timing.navigationStart;
//         event({
//           action: 'page_load_time',
//           category: 'Performance',
//           value: loadTime,
//         });
//       };

//       window.addEventListener('load', handleLoad);

//       // Track time to first byte
//       const observer = new PerformanceObserver((list: PerformanceObserverEntryList) => {
//         for (const entry of list.getEntries()) {
//           if (entry.entryType === 'navigation') {
//             const navEntry = entry as PerformanceNavigationTiming;
//             const ttfb: number = navEntry.responseStart - navEntry.requestStart;
//             event({
//               action: 'ttfb',
//               category: 'Performance',
//               value: Math.round(ttfb),
//             });
//           }
//         }
//       });

//       observer.observe({ entryTypes: ['navigation'] });

//       return () => {
//         window.removeEventListener('load', handleLoad);
//         observer.disconnect();
//       };
//     }
//   }, [isClient]);

//   // Only render script tags after client-side hydration and if GA_TRACKING_ID exists
//   if (!isClient || !GA_TRACKING_ID) {
//     return null;
//   }

//   return (
//     <>
//       <script
//         async
//         src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
//       />
//       <script
//         dangerouslySetInnerHTML={{
//           __html: `
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', '${GA_TRACKING_ID}', {
//               page_path: window.location.pathname,
//               anonymize_ip: true,
//               allow_google_signals: false,
//               allow_ad_personalization_signals: false
//             });
//           `,
//         }}
//       />
//     </>
//   );
// };

// const Analytics: React.FC = () => {
//   return (
//     <Suspense fallback={null}>
//       <AnalyticsInner />
//     </Suspense>
//   );
// };

// export default Analytics; 