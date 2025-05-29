// hooks/useIsMobile.ts
"use client";

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia('(max-width: 640px)');
  mql.addEventListener('change', callback);
  return () => {
    mql.removeEventListener('change', callback);
  };
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined') {
    return false; // Default for SSR
  }
  return window.matchMedia('(max-width: 640px)').matches;
}

function getServerSnapshot(): boolean {
  return false; // Consistent default for SSR
}

export function useIsMobile(): boolean {
  const isMobile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return isMobile;
}