/**
 * This file serves as a shared library for Google Analytics constants and helper functions.
 * It is used by `layout.tsx` for reporting web vitals and can be used by any other
 * component to send custom analytics events.
 *
 * Pageview tracking is handled automatically by the dedicated `GoogleAnalytics.tsx` component.
 */

// Type definition for custom event parameters.
export type GtagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

/**
 * These global type declarations provide strong typing for `window.gtag`,
 * which is used directly in `layout.tsx` for `reportWebVitals`. The function
 * overloads ensure that calls to `gtag` are type-safe.
 */
declare global {
  interface Window {
    // Overload for the 'config' command
    gtag(
      command: 'config',
      targetId: string,
      options?: {
        page_path?: string;
        [key: string]: unknown;
      }
    ): void;

    // Overload for the 'event' command
    gtag(
      command: 'event',
      action: string,
      params?: {
        event_category?: string;
        event_label?: string;
        value?: number;
        [key: string]: unknown;
      }
    ): void;
  }
}

// The shared Google Analytics Tracking ID, imported from environment variables.
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Sends a custom event to Google Analytics.
 * This is the primary way other components should send analytics data.
 *
 * @example
 * event({
 *   action: 'download_resume',
 *   category: 'engagement',
 *   label: 'Header Button',
 *   value: 1
 * })
 */
export const event = ({ action, category, label, value }: GtagEvent) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') {
    return;
  }

  // This call is strongly typed by the 'event' overload in the global declaration.
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};