'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

type Instance = { destroy?: () => void };
type Engine = { mount: (root: Element | Document) => Instance };
declare global {
  interface Window { ScrollCraft?: Engine; __sc?: Instance }
}

let loading: Promise<void> | null = null;
function loadEngine() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.ScrollCraft) return Promise.resolve();
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/scrollcraft/scrollcraft.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('scrollcraft failed to load'));
      document.head.appendChild(s);
    });
  }
  return loading;
}

/** Mounts the unmodified scroll-craft engine on every route, and tears the
 *  previous instance down first so client-side navigation never stacks loops. */
export default function ScrollCraftMount() {
  const pathname = usePathname();

  useEffect(() => {
    let instance: Instance | null = null;
    let dead = false;
    let raf = 0;
    loadEngine()
      .then(() => {
        if (dead) return;
        raf = requestAnimationFrame(() => {
          if (dead || !window.ScrollCraft) return;
          instance = window.ScrollCraft.mount(document.body);
          // The skill's verification scripts read the live instance from here.
          window.__sc = instance;
          document.documentElement.classList.add('sc-ready');
        });
      })
      .catch(() => document.documentElement.classList.add('sc-failed'));
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      instance?.destroy?.();
      if (window.__sc === instance) delete window.__sc;
    };
  }, [pathname]);

  return null;
}
