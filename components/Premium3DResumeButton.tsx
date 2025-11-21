'use client'

import { motion, Transition as FMTransition } from 'framer-motion';
import React from 'react';

interface ExtendedCSSProperties extends React.CSSProperties {
  WebkitBackgroundClip?: string;
}

interface Premium3DResumeButtonProps {
  onClick: () => void;
}

const Premium3DResumeButton = ({ onClick }: Premium3DResumeButtonProps) => {
  // Color variables
  const primaryRgb: string = "0, 0, 0"; 
  const accentGreenRgb: string = "184, 230, 45"; 
  const accentGreenHex: string = "#B8E62D";
  const whiteRgb: string = "255, 255, 255"; 

  const rootDivStyle: React.CSSProperties = {
    perspective: "1200px",
    transformStyle: "preserve-3d"
  };

  const mainButtonContainerStyle: React.CSSProperties = {
    transformStyle: "preserve-3d"
  };
  
  // Framer Motion transitions
  const rootTransition: FMTransition = { 
    duration: 1.8, 
    delay: 1.4,
    type: "spring",
    stiffness: 80,
    damping: 15
  };

  const whileInViewTransition: FMTransition = {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut"
  };

  const whileHoverTransition: FMTransition = { duration: 0.4, ease: "easeOut" };
  const whileTapTransition: FMTransition = { duration: 0.15 };
  const boxShadowTransition: FMTransition = { duration: 3, repeat: Infinity, ease: "easeInOut" };
  const animatedGradientOverlayTransition: FMTransition = { duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" };
  const morphingBackgroundShapesTransition: FMTransition = { duration: 4, repeat: Infinity, ease: "easeInOut" };
  
  // UPDATED: Made the container float + scale slightly to look like a "pulse"
  const iconContainerTransition: FMTransition = { 
    duration: 4, 
    repeat: Infinity, 
    ease: "easeInOut" 
  };
  
  const iconGlowTransition: FMTransition = { duration: 2, repeat: Infinity, ease: "easeInOut" };
  
  // UPDATED: Slower drawing speed for the complex star shape
  const iconPathTransition: FMTransition = { 
    duration: 3, 
    repeat: Infinity, 
    repeatType: "reverse", 
    ease: "easeInOut"
  };
  
  const textShadowTransition: FMTransition = { duration: 2, repeat: Infinity, ease: "easeInOut" };
  const textReflectionOpacityTransition: FMTransition = { duration: 2, repeat: Infinity, ease: "easeInOut" };
  const runningBorderTransition: FMTransition = { duration: 3, repeat: Infinity, ease: "linear" };


  return (
    <motion.div
      className="relative group cursor-pointer md:w-[60%] mx-auto "
      initial={{ opacity: 0, y: 90, rotateX: -25, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={rootTransition}
      whileInView={{
        rotateY: [0, 8, -8, 0],
        rotateX: [0, 3, -3, 0],
        transition: whileInViewTransition
      }}
      whileHover={{
        scale: 1.15, 
        rotateX: 8,
        rotateY: 12,
        z: 30, 
        transition: whileHoverTransition
      }}
      whileTap={{
        scale: 0.92,
        rotateX: -8,
        transition: whileTapTransition
      }}
      onClick={onClick}
      style={rootDivStyle}
    >
      <motion.div
        className="relative"
        style={mainButtonContainerStyle}
      >
        {/* Multiple depth layers */}
        {[...Array(6)].map((_, i: number) => {
          const depthLayerStyle: React.CSSProperties = {
            transform: `translateZ(-${(i + 1) * 6}px)`,
            background: `linear-gradient(135deg, 
              rgba(${primaryRgb}, ${0.6 - i * 0.08}) 0%, 
              rgba(${primaryRgb}, ${0.5 - i * 0.07}) 50%, 
              rgba(${primaryRgb}, ${0.4 - i * 0.06}) 100%)`,
            filter: `brightness(${1 - i * 0.15}) blur(${i * 0.3}px)`,
            boxShadow: `0 ${2 + i * 1}px ${4 + i * 2}px rgba(0,0,0,${0.05 + i * 0.03})`
          };
          return (
            <div
              key={i}
              className="absolute inset-0 rounded-3xl"
              style={depthLayerStyle}
            />
          );
        })}

        {/* Glass morphism main surface */}
        <motion.div
          className="relative px-5 py-5 rounded-3xl overflow-hidden"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(${primaryRgb}, 0.85) 0%, 
                rgba(${primaryRgb}, 0.8) 30%,
                rgba(${primaryRgb}, 0.75) 70%,
                rgba(${primaryRgb}, 0.7) 100%
              ),
              linear-gradient(45deg, 
                rgba(${whiteRgb}, 0.05) 0%, 
                transparent 50%, 
                rgba(${whiteRgb}, 0.02) 100%
              )
            `,
            backdropFilter: "blur(15px)",
            border: `1px solid rgba(${whiteRgb}, 0.1)`,
            boxShadow: `
              0 8px 15px rgba(${accentGreenRgb}, 0.15), 
              0 5px 10px rgba(${primaryRgb}, 0.25),   
              inset 0 1px 0 rgba(${whiteRgb}, 0.1),    
              inset 0 -1px 0 rgba(${primaryRgb}, 0.15), 
              0 0 10px rgba(${accentGreenRgb}, 0.1)    
            `,
            transformStyle: "preserve-3d"
          }}
          animate={{ 
            boxShadow: [
              `0 8px 15px rgba(${accentGreenRgb}, 0.15), 0 5px 10px rgba(${primaryRgb},0.25), inset 0 1px 0 rgba(${whiteRgb}, 0.1), inset 0 -1px 0 rgba(${primaryRgb},0.15), 0 0 10px rgba(${accentGreenRgb}, 0.1)`,
              `0 10px 20px rgba(${accentGreenRgb}, 0.2), 0 7px 14px rgba(${primaryRgb},0.3), inset 0 1px 0 rgba(${whiteRgb}, 0.15), inset 0 -1px 0 rgba(${primaryRgb},0.2), 0 0 15px rgba(${accentGreenRgb}, 0.15)`,
              `0 8px 15px rgba(${accentGreenRgb}, 0.15), 0 5px 10px rgba(${primaryRgb},0.25), inset 0 1px 0 rgba(${whiteRgb}, 0.1), inset 0 -1px 0 rgba(${primaryRgb},0.15), 0 0 10px rgba(${accentGreenRgb}, 0.1)`
            ]
          }}
          transition={boxShadowTransition}
        >
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{ background: `linear-gradient(45deg, transparent, rgba(${whiteRgb},0.15), transparent)`}}
            animate={{ x: ["-100%", "100%"], opacity: [0, 0.3, 0] }}
            transition={animatedGradientOverlayTransition}
          />

          {/* Morphing background shapes */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              background: [
                `radial-gradient(circle at 20% 20%, rgba(${whiteRgb},0.15) 0%, transparent 50%)`,
                `radial-gradient(circle at 80% 80%, rgba(${whiteRgb},0.15) 0%, transparent 50%)`,
                `radial-gradient(circle at 50% 50%, rgba(${whiteRgb},0.15) 0%, transparent 50%)`,
                `radial-gradient(circle at 20% 20%, rgba(${whiteRgb},0.15) 0%, transparent 50%)`
              ]
            }}
            transition={morphingBackgroundShapesTransition}
          />

          {/* Button content */}
            <div className="relative z-20 flex items-center justify-center space-x-3">
            {/* 
               --- ICON SECTION STARTS HERE --- 
               Replaced Arrow with a "Magical Sparkle/Star"
            */}
            <motion.div
              className="relative"
              // Updated animation to have a "twinkle" rotation and scale
              animate={{ y: [0, -4, 0], rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={iconContainerTransition}
            >
              <motion.div
                className="absolute inset-0 rounded-full blur-sm"
                style={{ backgroundColor: `rgba(${accentGreenRgb}, 0.15)`}}
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={iconGlowTransition}
              />
              <svg 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="relative z-10"
                style={{ color: accentGreenHex, filter: `drop-shadow(0 1px 2px rgba(${primaryRgb},0.4))` }}
              >
                {/* New Star/Sparkle Path */}
                <motion.path 
                  d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" 
                  stroke="currentColor"
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={iconPathTransition}
                />
              </svg>
            </motion.div>
             {/* --- ICON SECTION ENDS HERE --- */}
            
            <div className="relative text-center">
              <div className="relative inline-block px-4 py-1">
                <motion.span 
                  className="relative z-20 font-semibold text-[1rem] sm:text-2xl tracking-[0.32em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#F7FF8A] via-[#BFFE83] via-50% to-[#6FFFE3]"
                  style={{ 
                    letterSpacing: '0.32em',
                    textShadow: `0 1px 5px rgba(${primaryRgb},0.15)`
                  }}
                  animate={{
                    opacity: [0.85, 1, 0.85]
                  }}
                  transition={textShadowTransition}
                >
                  Let's Do It Nizar's Way
                </motion.span>
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 font-semibold text-[1rem] sm:text-2xl tracking-[0.32em] uppercase text-transparent bg-clip-text blur-[2px]"
                  style={{
                    letterSpacing: '0.32em',
                    backgroundImage: 'linear-gradient(100deg, rgba(111,255,227,0.55), rgba(247,255,138,0.4))'
                  }}
                  animate={{
                    opacity: [0.25, 0.5, 0.25],
                    translateY: [0, -2, 0]
                  }}
                  transition={textShadowTransition}
                >
                  Let's Do It Nizar's Way
                </motion.span>
              </div>
              <motion.span
                className="absolute top-full left-1/2 -translate-x-1/2 font-semibold text-[0.95rem] sm:text-[1.8rem] tracking-[0.32em] uppercase"
                style={{ 
                  color: `rgba(${whiteRgb}, 0.08)`, 
                  transform: "scaleY(-1)",
                  backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(${accentGreenRgb},0.3), transparent)`, 
                  WebkitBackgroundClip: "text", 
                  backgroundClip: "text",
                  opacity: 0.2 
                } as ExtendedCSSProperties}
                animate={{ opacity: [0.12, 0.34, 0.12], translateY: [0, 3, 0] }}
                transition={textReflectionOpacityTransition}
              >
                Let's Do It Nizar's Way
              </motion.span>
            </div>
          </div>

          {/* Particle system */}
          {[...Array(10)].map((_, i: number) => {
            const particlePositions = [
              { top: '20%', left: '15%' }, { top: '80%', left: '85%' },
              { top: '60%', left: '25%' }, { top: '30%', left: '75%' },
              { top: '45%', left: '10%' }, { top: '70%', left: '90%' },
              { top: '15%', left: '60%' }, { top: '85%', left: '40%' },
              { top: '35%', left: '50%' }, { top: '65%', left: '20%' }
            ];
            const particleStyle: React.CSSProperties = {
              background: i % 2 === 0 ? `rgba(${whiteRgb}, 0.6)` : accentGreenHex,
              top: particlePositions[i % particlePositions.length].top,
              left: particlePositions[i % particlePositions.length].left,
              boxShadow: `0 0 5px currentColor`
            };
            const particleTransition: FMTransition = { duration: 2.5 + (i * 0.2), repeat: Infinity, delay: i * 0.2, ease: "easeInOut"};
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={particleStyle}
                animate={{
                  y: [0, -20, 0], x: [0, Math.sin(i) * 15, 0],
                  opacity: [0, 0.8, 0], scale: [0, 1.2, 0], rotate: [0, 360]
                }}
                transition={particleTransition}
              />
            );
          })}

          {/* Energy pulse rings */}
          {[...Array(2)].map((_, i: number) => {
             const pulseRingTransition: FMTransition = { duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: "easeOut" };
            return(
            <motion.div
              key={i}
              className="absolute inset-0 rounded-3xl border border-white/10"
              animate={{ scale: [1, 1.8, 2.5], opacity: [0.3, 0.1, 0], rotate: [0, 90 + i*30] }}
              transition={pulseRingTransition}
            />
          )})}
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, 
                          transparent 0%, transparent 45%, 
                          ${accentGreenHex} 48%, ${accentGreenHex} 52%, 
                          transparent 55%, transparent 100%)`,
            backgroundSize: "300% 300%",
          }}
          animate={{ backgroundPosition: ["-100% -100%", "200% 200%"] }}
          transition={runningBorderTransition}
        />
      </motion.div>
    </motion.div>
  );
};

export default Premium3DResumeButton;