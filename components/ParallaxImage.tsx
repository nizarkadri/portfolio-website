'use client';

import { useScroll, useTransform, motion, progress } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

export default function ParallaxImage({ image, children}: { image: string ,children?: React.ReactNode}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const filter = useTransform(scrollYProgress, [0, 1], [
    'blur(0px) saturate(100%)',
    'blur(6px) saturate(0%)',
  ]);
 
  const title = ["Beyond","Work"]
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "110%"]);
  const scale = useTransform(scrollYProgress, [0, 1], ["1", "0.5"]);
  const scaleChildren = useTransform(scrollYProgress, [0, 1], ["1", "0"]);
  const opacity = useTransform(scrollYProgress, [0, 1], ["1", "0"]);

  return (
    <div ref={ref} className="relative h-[100vh] w-full">
      <motion.div
        className="absolute inset-0 -z-10 right-1/2"
        style={{ y, scale, opacity, filter }}
        >
      
        <Image
          src={image}
          alt="Parallax Background"
          width={1000}
          height={1000}
          className="object-cover"
          style={{ 
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat'
          }}
        />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-none z-[-1]" />

      </motion.div>

      <motion.div className="relative h-full left-1/2"
      
      >
        <motion.div className="relative h-full flex flex-col px-4">
        
        <motion.h2 
        className="text-[300px] absolute top-0 right-1/3 -translate-x-1/3  font-bold text-transparent bg-clip-text bg-[linear-gradient(to_right,#0005,#000f,#ffff)] select-none"
        style={{
          opacity: useTransform(scrollYProgress, [0, 1], ["0.5", "0"]),
          y:useTransform(scrollYProgress, [0, 1], ["0%", "150%"]),
          left:useTransform(scrollYProgress, [0, 1], ["-30%", "-100%"])
        }}
        // className='absolute top-0 right-1/3 -translate-x-1/2'
        >
            Beyond
          {/* {title[0].split('').map((c,i)=>{
            const opacity2 = useTransform(scrollYProgress, [0,1], [0.3, 0]);
            const scale2 = useTransform(scrollYProgress, [0,1], [1, 0]);
            return <motion.span 
            key={i} 
            className='text-[300px] text-white font-bold bg-clip-text  select-none'
            style={{
              opacity: opacity2,
              scale: scale2
            }}
            >
                {c}
            </motion.span>
          })} */}

        </motion.h2>
        <motion.h2 className="text-[200px] my-20 absolute right-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-50 font-extrabold text-transparent bg-clip-text bg-[linear-gradient(to_right,#0000,#B8E62D,#ffffff)] select-none"
        style={{
          opacity: useTransform(scrollYProgress, [0, 1], ["1", "0"]),
          y:useTransform(scrollYProgress, [0, 1], ["0%", "150%"]),
          x:useTransform(scrollYProgress, [0, 1], ["0%", "-100%"])
        }}
       
        >
          {title[1]}
        </motion.h2>
      </motion.div>
        {children}
        
      </motion.div>
      

    </div>
  );
}


