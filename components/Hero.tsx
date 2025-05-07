'use client'


import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';


const Hero = () => {
  
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const xFirstLine = useTransform(scrollYProgress, [0, 1], ['0%', '90%']);
  const xSecondLine = useTransform(scrollYProgress, [0, 1], ['0%', '-90%']);
  const opacityForBoth = useTransform(scrollYProgress, [0, 1], [1, 0]);
  

  return (
    
    <div ref={containerRef} className="relative h-[170vh]">
        {/* <ThreeScene /> */}
      <div className="sticky top-0 h-screen flex items-center justify-center bg-transparent overflow-hidden">
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 "
          style={{
            y: useTransform(scrollYProgress, [0, 1], ['0%', '50%']),
            opacity: useTransform(scrollYProgress, [0, 0.3, 0.6], [0.8, 0.6, 0.1]),
            scale: useTransform(scrollYProgress, [0, 1], [1, 1.2]),
            
         
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
          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-bold tracking-tighter mb-6" >

            <motion.span className="text-white bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/80"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 10 }}
            transition={{ duration: 0.9 ,ease:[0.4,0.1,0.1,0.1], delay: 0.9 }}
            style={{
              x: xFirstLine,
              opacity: opacityForBoth,
            }}
            >
              Turning Ideas into
            </motion.span>
            <motion.span
              
              className="block text-[#B8E62D] bg-clip-text text-transparent bg-gradient-to-r from-[#B8E62D] to-[#8fba1f] mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 , ease: "easeInOut", delay: 0.9 }}
              style={{
                x: xSecondLine,
                opacity: opacityForBoth,
                

              }}
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
