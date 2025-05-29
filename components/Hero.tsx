'use client'

import { useRef, useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ResumeRequestButton from './ResumeRequestButton';
import ResumeRequestModal from './ResumeRequestModal';

// Add type declaration for window.lenis
declare global {
  interface Window {
    lenis?: any;
  }
}

const Hero = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  // const isMobile = useMemo(
  //   () => typeof window !== 'undefined' && window.matchMedia('(max-width:640px)').matches,
  //   []
  // );
  const { scrollYProgress } = useScroll({ target: containerRef });
  const xFirstLine = useTransform(scrollYProgress, [0, 1], isMobile ? ['0%',  '45%']  : ['0%',  '90%']);
  const xSecondLine = useTransform(scrollYProgress, [0, 1], isMobile ? ['0%', '-45%'] : ['0%', '-90%']);
  const opacityForBoth = useTransform(scrollYProgress, [0, 1], [1, 0]);
  
  // State for popup modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  useLayoutEffect(() => {
    const mql = window.matchMedia('(max-width:640px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  
  // Optional: Listen to Lenis scroll events
  useEffect(() => {
    const handleLenisScroll = (e: any) => {
      // You can use Lenis scroll values here if needed
      // console.log(e.scroll, e.limit, e.velocity, e.direction, e.progress);
    };

    // Check if Lenis is available in the window object
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.on('scroll', handleLenisScroll);
    }

    return () => {
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.off('scroll', handleLenisScroll);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[100dvh] md:min-h-[170vh]">
      {/* Request Resume Button - Top Right */}
      <ResumeRequestButton 
      
      onClick={() => setIsModalOpen(true)} />

      {/* Modal Popup */}
      <ResumeRequestModal 
        
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* <ThreeScene /> */}
      <div className="sticky top-0 h-dvh flex items-center justify-center bg-transparent overflow-hidden pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{
            y: useTransform(scrollYProgress, [0, 1], ['0%', '50%']),
            opacity: useTransform(scrollYProgress, [0, 0.3, 0.6], [0.8, 0.6, 0.1]),
            scale: useTransform(scrollYProgress, [0, 1], [1, 1.2]),
          }}
        >
          <h1
            className="text-[clamp(30vw,20vw,20vw)] sm:text-[25vw] font-black text-transparent select-none tracking-tighter"
            style={{ WebkitTextStroke: '3px rgba(184,230,45,0.08)' }}
          >
            NIZAR
          </h1>
        </motion.div>

        <div className="z-10 relative text-center pointer-events-auto">
          <h1 className="text-[clamp(2.5rem,10vw,6rem)] sm:text-7xl lg:text-9xl font-bold tracking-tighter mt-10 md:mb-6 md:mt-0">
            <motion.span
              className="text-white bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/80"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.4, 0.1, 0.1, 0.1], delay: 0.9 }}
              style={{ x: xFirstLine, opacity: opacityForBoth }}
            >
              Turning Ideas into
            </motion.span>
            <motion.span
              className="block text-[#B8E62D] bg-clip-text text-transparent bg-gradient-to-r from-[#B8E62D] to-[#8fba1f] md:mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.9 }}
              style={{ x: xSecondLine, opacity: opacityForBoth }}
            >
              Technical Reality
            </motion.span>
          </h1>

          <motion.div
            className="mt-12 text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ↓ Scroll to explore
          </motion.div>
        </div>
      </div>

      {/* Page content after hero */}

    </div>
  );
};

export default Hero;

