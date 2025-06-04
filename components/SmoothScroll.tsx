'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

// Add type declaration for window.lenis
declare global {
  interface Window {
    lenis?: Lenis;
  }
}

interface LenisScrollToOptions {
  offset?: number;
  duration?: number;
  easing?: (t: number) => number;
  immediate?: boolean;
  lock?: boolean;
}
// Utility functions to control Lenis
export const lenisUtils = {
  scrollTo: (target: string | number | HTMLElement, options?: LenisScrollToOptions) => {
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.scrollTo(target, options);
    }
  },
  
  stop: () => {
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.stop();
    }
  },
  
  start: () => {
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.start();
    }
  },
  
  resize: () => {
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.resize();
    }
  },
  
  isScrolling: () => {
    if (typeof window !== 'undefined' && window.lenis) {
      return window.lenis.isScrolling;
    }
    return false;
  }
};

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;
    
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    const lenis = new Lenis({
      duration: isMobile ? 1.0 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: isMobile ? 0.8 : 1,
      touchMultiplier: isMobile ? 1.5 : 2,
      infinite: false,
      autoResize: true,
      syncTouch: false,
      syncTouchLerp: 0.075,
      touchInertiaMultiplier: 35,
    })

    // Add lenis to window for global access
    window.lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Optional: Add scroll event listener for debugging
    // lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
    //   // You can use these values to create effects
    //   // console.log({ scroll, limit, velocity, direction, progress })
    // })

    // Cleanup function
    return () => {
      lenis.destroy()
      window.lenis = undefined
    }
  }, [])

  return <>{children}</>
} 