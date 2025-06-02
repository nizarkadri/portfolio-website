'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

// Add type declaration for window.lenis
declare global {
  interface Window {
    lenis?: Lenis;
  }
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    
    const lenis = new Lenis({
      duration: isMobile ? 0.8 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: !isMobile,
      wheelMultiplier: 1,
      touchMultiplier: isMobile ? 1.5 : 2,
      infinite: false,
      
    })

    // Add lenis to window for global access
    window.lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }: any) => {
    //   limit = 100;
    //   velocity = 10;
    //   direction = 100;
    //   progress = 100;

    //   // You can use these values to create effects
    //   // console.log({ scroll, limit, velocity, direction, progress })
    // })

    return () => {
      lenis.destroy()
      window.lenis = undefined
    }
  }, [])

  return <>{children}</>
} 