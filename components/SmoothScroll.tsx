'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

// Add type declaration for window.lenis
declare global {
  interface Window {
    lenis?: any;
  }
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2
    })

    // Add lenis to window for global access
    window.lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }: any) => {
      // You can use these values to create effects
      // console.log({ scroll, limit, velocity, direction, progress })
    })

    return () => {
      lenis.destroy()
      window.lenis = undefined
    }
  }, [])

  return <>{children}</>
} 