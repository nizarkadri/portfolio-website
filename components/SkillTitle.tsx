'use client';

import { motion } from 'framer-motion';
import { titleVariants, highlightVariants} from '../utils/animations';
import {useIsMobile} from '../app/hooks/useMobile';

const SkillTitle = () => {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col items-center mb-16">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        className="relative"
      >
        <motion.h2 
          className="huge-text font-bold text-[#B8E62D]/90 mb-2"
          // huge-text absolute top-6 md:-top-16 left-[7%] md:left-0 md:translate-x-0 opacity-80 text-[#B8E62D]/90 font-bold select-none
          variants={titleVariants}
        >
          {isMobile ? 'Skills' : 'Skills & Expertise'}
        </motion.h2>
        <motion.div 
          className="absolute -bottom-2 left-0 h-0.5 bg-[#B8E62D]/10 rounded-full"
          variants={highlightVariants}
        />
        {/* <motion.div 
          className="absolute -right-8 -top-6 text-[#B8E62D] opacity-50"
          variants={decorationVariants}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17L6.12 21.5L8 14.87L2 10.5L8.6 10.13L12 4L15.4 10.13L22 10.5L16 14.87L17.88 21.5L12 17Z" fill="currentColor"/>
          </svg>
        </motion.div> */}
      </motion.div>
      <motion.p 
        className="text-lg md:text-xl text-soft-white/70 text-center max-w-3xl mt-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            delay: 0.4
          }
        }}
        viewport={{ once: false, margin: "-100px" }}
      >
        Technologies and frameworks I work with
      </motion.p>
    </div>
  );
};

export default SkillTitle; 