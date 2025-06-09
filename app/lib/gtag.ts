// Type definitions
export type GtagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

/**
 * These overloads provide strong typing for the most common gtag commands.
 * They ensure that the command name and required parameters are correct.
 * 
 * The use of `[key: string]: unknown` in the options/params objects is a pragmatic
 * choice. It allows for the flexibility of custom Gtag parameters while still
 * typing the known, standard ones.
 */
declare global {
  interface Window {
    // Overload for the 'config' command
    gtag(
      command: 'config',
      targetId: string,
      options?: {
        page_path?: string;
        [key: string]: unknown; // Allows for other config options
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
        [key: string]: unknown; // Allows for custom event parameters
      }
    ): void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;
  
  // This call is now strongly typed by the 'config' overload
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: GtagEvent) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;
  
  // This call is now strongly typed by the 'event' overload
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};