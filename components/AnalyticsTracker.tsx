'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
// Suggestion: Use a path alias for cleaner imports
import { pageview } from '../app/lib/gtag'; 

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Correctly construct the URL
    const searchString = searchParams.toString();
    const url = pathname + (searchString ? `?${searchString}` : '');
    pageview(url);
    
  }, [pathname, searchParams]);

  return null;
}