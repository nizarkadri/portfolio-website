'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import Image from 'next/image';

interface ParallaxImageProps {
  image: string;
  isMobile: boolean;
  children?: ReactNode;
}

export default function ParallaxImage({ image, isMobile, children }: ParallaxImageProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });


  /* create motion values once, outside JSX */
  const filter     = useTransform(scrollYProgress, [0, 1], ['blur(0px) saturate(100%)', 'blur(6px) saturate(0%)']);
  const y          = useTransform(scrollYProgress, [0, 1], ['0%', '110%']);
  const scale      = useTransform(scrollYProgress, [0, 1], ['1', '0.5']);
  const opacityImg = useTransform(scrollYProgress, [0, 1], ['1', '0']);
  const opacityTop = useTransform(scrollYProgress, [0, 1], ['0.5', '0']);
  const leftTop    = useTransform(scrollYProgress, [0, 1], ['-30%', '-100%']);
  const yTop       = useTransform(scrollYProgress, [0, 1], ['0%', '150%']);
  const opacityMid = useTransform(scrollYProgress, [0, 1], ['1', '0']);
  const xMid       = useTransform(scrollYProgress, [0, 1], ['0%', '-100%']);
  const yMid       = useTransform(scrollYProgress, [0, 1], ['0%', '150%']);

  const panelH = useTransform(scrollYProgress, [0, 1], ['20vh', '400vh']);

  if (isMobile) {

    /* ─────────────────────────────────────────────
       1.  Early-return keeps JSX simple.
    ───────────────────────────────────────────── */
    
    return (
      <div ref={ref} className="h-[100vh] flex items-center justify-center bg-black/90 text-white">
        {/* Replace placeholder with a real lightweight mobile banner if you like */}
        <div className="absolute sticky top-0 inset-0 h-[100vh] w-full -z-10">
          <Image
            src={image}
            alt="Portrait of nizar"
            fill
            priority
            className="object-cover"
          
          />
        </div>
        <motion.div className="absolute flex flex-col justify-center bg-black/90 w-full"
       
        style={{ height: panelH }}
        >
        <h2
          className="p-4 text-8xl font-bold select-none text-center"
        >
          Beyond
        </h2>

        <h2
          className="text-7xl font-extrabold select-none text-center"
          
        >
          Work
        </h2>

        {children}
      </motion.div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     2.  Desktop / tablet version
  ───────────────────────────────────────────── */
  

  return (
    <div ref={ref} className="relative h-[100dvh] w-full overflow-hidden">
      {/* background image */}
      <motion.div
        className="absolute inset-0 right-1/2 -z-10"
        style={{ y, scale, opacity: opacityImg, filter }}
      >
        <Image
          src={image}
          alt=""
          width={1200}
          height={1200}
          priority
          className="object-cover w-full h-full"
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
          }}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />
      </motion.div>

      {/* foreground titles */}
      <div className="relative h-full left-1/2 flex flex-col justify-center">
        <motion.h2
          className="absolute top-0 right-1/3 -translate-x-1/3 font-bold select-none"
          style={{
            fontSize: 'clamp(4rem,20vw,14rem)',   // mobile-safe fallback even if this branch renders later
            opacity: opacityTop,
            y: yTop,
            left: leftTop,
            WebkitTextFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            backgroundImage: 'linear-gradient(to right,#0005,#000f,#ffff)',
          }}
        >
          Beyond
        </motion.h2>

        <motion.h2
          className="absolute right-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-extrabold select-none"
          style={{
            fontSize: 'clamp(3rem,16vw,12rem)',
            opacity: opacityMid,
            y: yMid,
            x: xMid,
            WebkitTextFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            backgroundImage: 'linear-gradient(to right,#0000,#B8E62D,#ffffff)',
          }}
        >
          Work
        </motion.h2>

        {children}
      </div>
    </div>
  );
}
