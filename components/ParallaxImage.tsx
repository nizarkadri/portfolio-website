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
  const y          = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const scale      = useTransform(scrollYProgress, [0, 1], ['1', '1.1']);
  const opacityImg = useTransform(scrollYProgress, [0, 1], ['1', '0.4']);

  if (isMobile) {
    return (
      <div ref={ref} className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <motion.div 
          className="absolute inset-0 -z-10"
          style={{ y, scale, opacity: opacityImg }}
        >
          <Image
            src={image}
            alt="Portrait"
            fill
            priority
            className="object-cover object-top"
          />
        </motion.div>
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
    );
  }

  /* Desktop / tablet version */
  return (
    <div ref={ref} className="relative h-screen w-full overflow-hidden">
      {/* Background Image - Full Width */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y, scale, opacity: opacityImg }}
      >
        <Image
          src={image}
          alt="Portrait"
          fill
          priority
          className="object-cover object-top"
        />
      </motion.div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
