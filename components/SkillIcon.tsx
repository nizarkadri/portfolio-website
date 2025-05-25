'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createFloatAnimation, createPulseAnimation } from '../utils/animations';
import { 
  getSkillGlowColors, 
  needsBackground, 
  isPngIcon, 
  getSvgTileEffectStyles, 
  getPngBackgroundStyles,
  type PositionProps 
} from '../utils/skill-utils';

interface SkillIconProps {
  skill: string;
  index: number;
  skillId: string;
  position: PositionProps;
  isHighlighted: boolean;
  prefersReducedMotion: boolean | null;
  iconSize?: number;
}

const SkillIcon: React.FC<SkillIconProps> = ({ 
  skill, 
  index, 
  skillId, 
  position, 
  isHighlighted, 
  prefersReducedMotion,
  iconSize = 80
}) => {
  const [isHovered, setIsHovered] = useState(false);
  // const glowColors = getSkillGlowColors(skill);
  // const requiresBackground = needsBackground(skill);
  const isPng = isPngIcon(skill);
  const isWordPress = skill === 'WordPress' || skill === 'Wordpress';
  const isJsOrTs = skill === 'JavaScript' || skill === 'Typescript';

  // If user prefers no motion, skip fancy animations
  const floatVariants = prefersReducedMotion
    ? { animate: { scale: 1 } }
    : createFloatAnimation(position.duration, position.delay);

  const pulseVariants = prefersReducedMotion
    ? { animate: { opacity: 0.9 } }
    : createPulseAnimation(position.duration);
  
  return (
    <motion.div
      key={skillId}
      className="absolute flex flex-col items-center cursor-pointer"
      style={{
        left: position.x,
        top: position.y,
        width: iconSize,
        height: iconSize,
        transform: `translateX(${position.translateX}px) translateY(${position.translateY}px)`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isHighlighted ? 1 : 0.95,
        scale: isHighlighted ? 1.03 : 1,
        y: 0,
        zIndex: isHighlighted ? 50 : isWordPress ? 30 : 'auto',
      }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
      transition={{
        duration: 0.6,
        delay: index * 0.05,
        ease: [0.33, 1, 0.68, 1], // Mobbin-like easing
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="relative flex items-center justify-center w-full h-full"
      >
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className="w-[90%] h-[90%] relative z-10 flex items-center justify-center rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            background: isJsOrTs ? 'transparent' : '#18181B',
          }}
        >
          {/* Clean background for icons - Mobbin style */}
          {!isJsOrTs && (
            <div className="absolute inset-0 rounded-2xl shadow-lg bg-[#18181B] z-10" 
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                  transform: 'translateZ(-2px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
            />
          )}

          {/* Tile Effect - Different styling for PNG vs SVG */}
          {!isJsOrTs && (
            <div 
              className={`absolute ${isPng ? 'inset-[8%]' : 'inset-[10%]'} z-15 rounded-xl`} 
              style={isPng ? getPngBackgroundStyles(skill) : getSvgTileEffectStyles(skill)}
            />
          )}

          <img
            src={`/images/NewIcons/${skill === 'C_Sharp' ? 'CSharp' : skill}${isPng ? '.png' : '.svg'}`}
            alt={skill === 'C_Sharp' ? 'C#' : skill.replace('_', ' ').replace('-', ' ')}
            className={`
              w-full h-full object-contain transition-all duration-300 relative z-20
              ${isJsOrTs ? '' : 'p-2 rounded-2xl'}
              ${isPng ? 'filter brightness-100 contrast-100' : 'filter brightness-100 contrast-100 saturate-100'}
              scale-110
            `}
            style={{
              imageRendering: 'crisp-edges',
              mixBlendMode: 'normal'
            }}
          />
        </motion.div>
      </motion.div>

      <div className="mt-2 absolute -bottom-6">
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 5,
            scale: isHovered ? 1 : 0.95
          }}
          transition={{
            duration: 0.2,
            ease: [0.33, 1, 0.68, 1]
          }}
          className="text-xs font-medium bg-[#1F2937] px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap block text-[#E5E7EB]"
        >
          {skill === 'C_Sharp' ? 'C#' : skill.replace('_', ' ').replace('-', ' ')}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default SkillIcon; 