'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();

  // Different transition variants for different routes
  const getTransitionVariant = (path: string) => {
    if (path === '/') return 'fadeUp';
    if (path.includes('/projects')) return 'slideLeft';
    if (path.includes('/experience')) return 'slideRight';
    if (path.includes('/about')) return 'scale';
    if (path.includes('/contact')) return 'curtain';
    return 'fade';
  };

  // Get color for each route
  const getRouteColor = (path: string) => {
    if (path === '/') return '#B8E62D'; // Lime green for home
    if (path.includes('/projects')) return '#8fba1f'; // Darker lime for projects
    if (path.includes('/experience')) return '#a3cc29'; // Medium lime for experience
    if (path.includes('/about')) return '#9dd127'; // Bright lime for about
    if (path.includes('/contact')) return '#7aa61c'; // Deep lime for contact
    return '#B8E62D'; // Default lime
  };

  const transitionVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    fadeUp: {
      initial: { opacity: 0, y: 30, filter: 'blur(4px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, y: -30, filter: 'blur(4px)' }
    },
    slideLeft: {
      initial: { opacity: 0, x: 100, rotateY: 15 },
      animate: { opacity: 1, x: 0, rotateY: 0 },
      exit: { opacity: 0, x: -100, rotateY: -15 }
    },
    slideRight: {
      initial: { opacity: 0, x: -100, rotateY: -15 },
      animate: { opacity: 1, x: 0, rotateY: 0 },
      exit: { opacity: 0, x: 100, rotateY: 15 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9, filter: 'blur(6px)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 1.1, filter: 'blur(6px)' }
    },
    curtain: {
      initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
      exit: { opacity: 0, clipPath: 'inset(0 0 0 100%)' }
    }
  };

  // Overlay transition variants
  const overlayVariants = {
    fade: {
      initial: { opacity: 0, scale: 1.1 },
      animate: { opacity: 0.15, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    },
    fadeUp: {
      initial: { opacity: 0, y: '100%' },
      animate: { opacity: 0.2, y: '0%' },
      exit: { opacity: 0, y: '-100%' }
    },
    slideLeft: {
      initial: { opacity: 0, x: '100%', skewX: 15 },
      animate: { opacity: 0.15, x: '0%', skewX: 0 },
      exit: { opacity: 0, x: '-100%', skewX: -15 }
    },
    slideRight: {
      initial: { opacity: 0, x: '-100%', skewX: -15 },
      animate: { opacity: 0.15, x: '0%', skewX: 0 },
      exit: { opacity: 0, x: '100%', skewX: 15 }
    },
    scale: {
      initial: { opacity: 0, scale: 0, rotate: -180 },
      animate: { opacity: 0.1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 2, rotate: 180 }
    },
    curtain: {
      initial: { opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' },
      animate: { opacity: 0.2, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' },
      exit: { opacity: 0, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }
    }
  };

  const variant = getTransitionVariant(pathname);
  const routeColor = getRouteColor(pathname);
  const variants = transitionVariants[variant as keyof typeof transitionVariants];
  const overlayVariant = overlayVariants[variant as keyof typeof overlayVariants];

  // Custom transition settings for different effects
  const getTransitionConfig = (variant: string) => {
    switch (variant) {
      case 'fadeUp':
        return {
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
        };
      case 'slideLeft':
      case 'slideRight':
        return {
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        };
      case 'scale':
        return {
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        };
      case 'curtain':
        return {
          duration: 0.9,
          ease: [0.83, 0, 0.17, 1],
        };
      default:
        return {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        };
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={getTransitionConfig(variant)}
        className="w-full min-h-screen relative"
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Page content */}
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition; 