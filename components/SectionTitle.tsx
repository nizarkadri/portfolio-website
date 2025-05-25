'use client';

import { motion } from 'framer-motion';
import { titleVariants, highlightVariants, decorationVariants } from '../utils/animations';

const SectionTitle = () => {
  return (
    <div className="flex flex-col items-center mb-16">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        className="relative"
      >
        <motion.h2 
          className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#B8E62D] to-[#89D32D] mb-2"
          variants={titleVariants}
        >
          Skills & Expertise
        </motion.h2>
        <motion.div 
          className="absolute -bottom-2 left-0 h-1 bg-[#B8E62D]/30 rounded-full"
          variants={highlightVariants}
        />
        <motion.div 
          className="absolute -right-8 -top-6 text-[#B8E62D] opacity-50"
          variants={decorationVariants}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17L6.12 21.5L8 14.87L2 10.5L8.6 10.13L12 4L15.4 10.13L22 10.5L16 14.87L17.88 21.5L12 17Z" fill="currentColor"/>
          </svg>
        </motion.div>
      </motion.div>
      <motion.p 
        className="text-xl text-soft-white/70 text-center max-w-3xl mt-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            delay: 0.4
          }
        }}
        viewport={{ once: true, margin: "-100px" }}
      >
        Technologies and frameworks I work with
      </motion.p>
    </div>
  );
};

export default SectionTitle; 