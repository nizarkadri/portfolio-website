'use client'

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero = () => {
  const words = ["Scalable Solutions", "Digital Products", "Technical Reality"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrollUnlocked, setScrollUnlocked] = useState(false);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Mouse parallax
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (e.clientX - centerX) / centerX * -10;
      const moveY = (e.clientY - centerY) / centerY * -5;
      setMousePosition({ x: moveX, y: moveY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll handling (lock/unlock)
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTime = 0;

    const handleScroll = (e: WheelEvent | TouchEvent) => {
      if (scrollUnlocked) return;
      e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime < 400) return;

      const delta = (e as WheelEvent).deltaY || (e as TouchEvent).changedTouches?.[0]?.clientY || 0;
      setCurrentWordIndex(prev => {
        let next = delta > 0 ? prev + 1 : prev - 1;
        next = Math.max(0, Math.min(words.length - 1, next));
        if (next === words.length - 1) {
          setTimeout(() => {
            setScrollUnlocked(true);
            document.body.style.overflow = 'auto';
          }, 300);
        }
        return next;
      });

      lastScrollTime = now;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {}, 500);
    };

    if (!scrollUnlocked) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', handleScroll, { passive: false });
      window.addEventListener('touchmove', handleScroll, { passive: false });
    }

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, [scrollUnlocked]);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center bg-black overflow-hidden">
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 perspective-[1000px]"
          style={{
            y: useTransform(scrollYProgress, [0, 1], ['0%', '50%']),
            opacity: useTransform(scrollYProgress, [0, 0.3, 0.6], [0.8, 0.6, 0.4]),
            scale: useTransform(scrollYProgress, [0, 1], [1, 1.2]),
            rotateX: useTransform(scrollYProgress, [0, 1], [0, -5]),
            rotateY: useTransform(scrollYProgress, [0, 1], [0, 3]),
            x: `${mousePosition.x}px`,
            translateY: `${mousePosition.y}px`,
          }}
        >
          <h1
            className="text-[25vw] font-black text-transparent select-none tracking-tighter"
            style={{ WebkitTextStroke: '3px rgba(184, 230, 45, 0.08)' }}
          >
            NIZAR
          </h1>
        </motion.div>

        <div className="z-10 relative text-center">
          <motion.h1
            className="text-6xl sm:text-7xl lg:text-9xl font-bold tracking-tighter mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-white bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/80">
              Turning Ideas into
            </span>
            <motion.span
              key={currentWordIndex}
              className="block text-[#B8E62D] bg-clip-text text-transparent bg-gradient-to-r from-[#B8E62D] to-[#8fba1f] mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {words[currentWordIndex]}
            </motion.span>
          </motion.h1>

          {scrollUnlocked && (
            <motion.div
              className="mt-12 text-white/60 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              ↓ Scroll to explore
            </motion.div>
          )}
        </div>
      </div>

      {/* Page content after hero */}

    </div>
  );
};

export default Hero;
