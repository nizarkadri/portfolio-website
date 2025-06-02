'use client'

import { useRef, useState, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import ResumeRequestModal from './ResumeRequestModal';
import Premium3DResumeButton from './Premium3DResumeButton';

// Add type declaration for window.lenis
// declare global {
//   interface Window {
//     lenis?: any;
//   }
// }

const Hero = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  // Initialize mobile detection immediately to prevent flash
  useLayoutEffect(() => {
    const checkMobile = () => {
      const mql = window.matchMedia('(max-width: 640px)');
      setIsMobile(mql.matches);
      return mql;
    };
    
    const mql = checkMobile();
    const update = () => setIsMobile(mql.matches);
    
    mql.addEventListener('change', update);
    setIsClient(true);
    
    return () => mql.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({ 
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // TEXT ANIMATIONS - Start early and finish by middle of scroll
  const xFirstLine = useTransform(
    scrollYProgress, 
    [0, 0.4], // Animation happens in first 40% of scroll
    isMobile ? ['0%', '25%'] : ['0%', '90%']
  );
  
  const xSecondLine = useTransform(
    scrollYProgress, 
    [0, 0.4], // Animation happens in first 40% of scroll
    isMobile ? ['0%', '-25%'] : ['0%', '-90%']
  );
  
  const opacityForBoth = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.4], // Fade out happens earlier
    [1, 0.8, 0]
  );

  // BACKGROUND ANIMATIONS - Continue throughout entire scroll for parallax effect
  const backgroundY = useTransform(
    scrollYProgress, 
    [0, 1], // Full scroll range for parallax
    isMobile ? ['0%', '30%'] : ['0%', '50%']
  );
  
  const backgroundOpacity = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], // Longer fade for background
    [0.8, 0.4, 0.1]
  );
  
  const backgroundScale = useTransform(
    scrollYProgress, 
    [0, 1], // Full scroll range
    isMobile ? [1, 1.1] : [1, 1.2]
  );

  // Don't render animations until client-side hydration is complete
  if (!isClient) {
    return (
      <div ref={containerRef} className="relative min-h-[100dvh] md:min-h-[170vh]">
        <div className="sticky top-0 h-dvh flex items-center justify-center bg-transparent overflow-hidden pointer-events-none pb-[env(safe-area-inset-bottom)]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <h1
              className="text-[clamp(30vw,20vw,20vw)] sm:text-[25vw] font-black text-transparent select-none tracking-tighter"
              style={{ WebkitTextStroke: '3px rgba(184,230,45,0.08)' }}
            >
              NIZAR
            </h1>
          </div>

          <div className="z-10 relative text-center pointer-events-auto">
            <h1 className="text-[clamp(2.5rem,10vw,6rem)] sm:text-7xl lg:text-9xl font-bold tracking-tighter mt-10 md:mb-6 md:mt-0">
              <span className="text-white bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/80">
                Turning Ideas into
              </span>
              <span className="block text-[#B8E62D] bg-clip-text text-transparent bg-gradient-to-r from-[#B8E62D] to-[#8fba1f] md:mt-4">
                Technical Reality
              </span>
            </h1>
            <div className="mt-12">
              <Premium3DResumeButton onClick={() => setIsModalOpen(true)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div ref={containerRef} className="relative min-h-[100dvh] md:min-h-[170vh]">
      <div className="sticky top-0 h-dvh flex items-center justify-center bg-transparent overflow-hidden pointer-events-none pb-[env(safe-area-inset-bottom)]">
        {/* Background - continues parallax throughout entire scroll */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{
            y: shouldReduceMotion ? 0 : backgroundY,
            opacity: shouldReduceMotion ? 0.8 : backgroundOpacity,
            scale: shouldReduceMotion ? 1 : backgroundScale,
          }}
        >
          <motion.h1
            className="text-[clamp(30vw,20vw,20vw)] sm:text-[25vw] font-black text-transparent select-none tracking-tighter"
            style={{ WebkitTextStroke: '3px rgba(184,230,45,0.08)',transform: 'translateY(-5vh)' } }
            
          >
            NIZAR
          </motion.h1>
        </motion.div>

          {/* Text - animates early and stays in place */}
          <div className="z-10 relative text-center pointer-events-auto">
            <h1 className="text-[clamp(2.5rem,10vw,6rem)] sm:text-7xl lg:text-9xl font-bold tracking-tighter mt-10 md:mb-6 md:mt-0">
              <motion.span
                className="text-white bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/80"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  x: shouldReduceMotion ? 0 : xFirstLine,
                  opacity: shouldReduceMotion ? 1 : opacityForBoth,
                }}
              >
                Turning Ideas into
              </motion.span>
              <motion.span
                className="block text-[#B8E62D] bg-clip-text text-transparent bg-gradient-to-r from-[#B8E62D] to-[#8fba1f] md:mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{
                  x: shouldReduceMotion ? 0 : xSecondLine,
                  opacity: shouldReduceMotion ? 1 : opacityForBoth,
                }}
              >
                Technical Reality
              </motion.span>
            </h1>
            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{
                opacity: shouldReduceMotion ? 1 : opacityForBoth,
              }}
            >
              <Premium3DResumeButton onClick={() => setIsModalOpen(true)} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Resume Request Modal */}
      <ResumeRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Hero;

