'use client'

import { motion, TargetAndTransition, Transition as FMTransition } from 'framer-motion'; // Import specific types if needed for clarity
import React from 'react'; // Import React for CSSProperties

// Define a more specific type for style objects if complex, though React.CSSProperties usually suffices
interface ExtendedCSSProperties extends React.CSSProperties {
  WebkitBackgroundClip?: string; // Ensure non-standard props are known
  // Add other non-standard properties if necessary
}

interface Premium3DResumeButtonProps {
  onClick: () => void;
}

const Premium3DResumeButton = ({ onClick }: Premium3DResumeButtonProps) => {
  // Color variables for easy customization
  const primaryRgb: string = "0, 0, 0"; // Base for black/dark backgrounds
  const primaryHex: string = "#000000";

  const accentGreenRgb: string = "184, 230, 45"; // The prominent green color (original green)
  const accentGreenHex: string = "#B8E62D";
  
  const whiteRgb: string = "255, 255, 255"; // For highlights, light borders, etc.
  // const whiteHex: string = "#FFFFFF"; // Not used, can be removed if not needed elsewhere

  // Style objects using React.CSSProperties or our extended version for clarity
  const rootDivStyle: React.CSSProperties = {
    perspective: "1200px",
    transformStyle: "preserve-3d"
  };

  const mainButtonContainerStyle: React.CSSProperties = {
    transformStyle: "preserve-3d"
  };
  
  // Framer Motion transition objects
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
  const iconContainerTransition: FMTransition = { duration: 3, repeat: Infinity, ease: "easeInOut" };
  const iconGlowTransition: FMTransition = { duration: 2, repeat: Infinity, ease: "easeInOut" };
  const iconPathTransition: FMTransition = { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut"};
  const textShadowTransition: FMTransition = { duration: 2, repeat: Infinity, ease: "easeInOut" };
  const textReflectionOpacityTransition: FMTransition = { duration: 2, repeat: Infinity, ease: "easeInOut" };
  const runningBorderTransition: FMTransition = { duration: 3, repeat: Infinity, ease: "linear" };


  return (
    <motion.div
      className="relative group cursor-pointer w-[60%] mx-auto " // User's class
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
      {/* Floating geometric shapes around button (user commented out) */}
      {/* {[...Array(8)].map((_, i: number) => ( ... ))} */}

      {/* Main button with glass morphism and advanced 3D */}
      <motion.div
        className="relative"
        style={mainButtonContainerStyle}
      >
        {/* Multiple depth layers for extreme 3D effect */}
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
          style={{ // This style object is dynamic due to color variables
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
          animate={{ // TargetAndTransition type is inferred by Framer Motion
            boxShadow: [
              `0 8px 15px rgba(${accentGreenRgb}, 0.15), 0 5px 10px rgba(${primaryRgb},0.25), inset 0 1px 0 rgba(${whiteRgb}, 0.1), inset 0 -1px 0 rgba(${primaryRgb},0.15), 0 0 10px rgba(${accentGreenRgb}, 0.1)`,
              `0 10px 20px rgba(${accentGreenRgb}, 0.2), 0 7px 14px rgba(${primaryRgb},0.3), inset 0 1px 0 rgba(${whiteRgb}, 0.15), inset 0 -1px 0 rgba(${primaryRgb},0.2), 0 0 15px rgba(${accentGreenRgb}, 0.15)`,
              `0 8px 15px rgba(${accentGreenRgb}, 0.15), 0 5px 10px rgba(${primaryRgb},0.25), inset 0 1px 0 rgba(${whiteRgb}, 0.1), inset 0 -1px 0 rgba(${primaryRgb},0.15), 0 0 10px rgba(${accentGreenRgb}, 0.1)`
            ]
          }}
          transition={boxShadowTransition}
        >
          {/* Animated gradient overlay (kept subtle) */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{ background: `linear-gradient(45deg, transparent, rgba(${whiteRgb},0.15), transparent)`}}
            animate={{ x: ["-100%", "100%"], opacity: [0, 0.3, 0] }}
            transition={animatedGradientOverlayTransition}
          />

          {/* Morphing background shapes (kept subtle) */}
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

          {/* Button content with enhanced styling */}
          <div className="relative z-20 flex items-center justify-center space-x-3">
            <motion.div
              className="relative"
              animate={{ y: [0, -3, 0], rotateZ: [0, 5, -5, 0] }}
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
                <motion.path 
                  d="M12 2V16M12 16L8 12M12 16L16 12M3 20H21" 
                  stroke="currentColor"
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={iconPathTransition}
                />
              </svg>
            </motion.div>
            
            <div className="relative">
              <motion.span 
                className="font-bold text-xl tracking-wide relative z-10"
                style={{ color: accentGreenHex, textShadow: `0 1px 2px rgba(${primaryRgb},0.6), 0 0px 1px rgba(${whiteRgb},0.1)`}}
                animate={{
                  textShadow: [
                    `0 1px 2px rgba(${primaryRgb},0.6), 0 0px 1px rgba(${whiteRgb},0.1)`,
                    `0 2px 3px rgba(${primaryRgb},0.7), 0 1px 1px rgba(${whiteRgb},0.15)`,
                    `0 1px 2px rgba(${primaryRgb},0.6), 0 0px 1px rgba(${whiteRgb},0.1)`
                  ]
                }}
                transition={textShadowTransition}
              >
                Download Resume
              </motion.span>
              <motion.span
                className="absolute top-full left-0 font-bold text-xl tracking-wide"
                style={{ // ExtendedCSSProperties ensures WebkitBackgroundClip is recognized if not in standard React.CSSProperties
                  color: `rgba(${accentGreenRgb}, 0.15)`, 
                  transform: "scaleY(-1)",
                  backgroundImage: `linear-gradient(to bottom, rgba(${primaryRgb},0.05), transparent)`, 
                  WebkitBackgroundClip: "text", // Explicitly typed via ExtendedCSSProperties or rely on csstype
                  backgroundClip: "text",
                  opacity: 0.4 
                } as ExtendedCSSProperties} // Cast if needed, though often inferred well
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={textReflectionOpacityTransition}
              >
                Download Resume
              </motion.span>
            </div>
          </div>

          {/* Advanced particle system (kept subtle) */}
          {[...Array(10)].map((_, i: number) => {
            const particlePositions = [ // This array structure is inferred correctly
              { top: '20%', left: '15%' }, { top: '80%', left: '85%' },
              { top: '60%', left: '25%' }, { top: '30%', left: '75%' },
              { top: '45%', left: '10%' }, { top: '70%', left: '90%' },
              { top: '15%', left: '60%' }, { top: '85%', left: '40%' },
              { top: '35%', left: '50%' }, { top: '65%', left: '20%' } // Ensure enough for 10 particles
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

          {/* Energy pulse rings (kept very subtle) */}
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

      {/* Floating holographic elements (user commented out) */}
      {/* {[...Array(4)].map((_, i: number) => ( ... ))} */}
    </motion.div>
  );
};

export default Premium3DResumeButton;