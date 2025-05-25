/** Subtle 3D float for each icon - Mobbin-inspired animation */
export const createFloatAnimation = (duration: number, delay: number) => ({
  animate: {
    y: [0, -8, 0],
    opacity: [0.95, 1, 0.95],
    transition: {
      y: {
        duration: duration * 0.4,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: [0.33, 1, 0.68, 1], // cubic-bezier curve similar to Mobbin
        delay
      },
      opacity: {
        duration: duration * 0.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: [0.33, 1, 0.68, 1],
        delay: delay + 0.2
      }
    },
  }
});

/** Subtle "glow" animation (Mobbin style) */
export const createPulseAnimation = (duration: number) => ({
  animate: {
    boxShadow: [
      '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      '0 6px 16px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
      '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
    ],
    transform: [
      'translateZ(-2px)',
      'translateZ(-1px)',
      'translateZ(-2px)',
    ],
    transition: {
      boxShadow: {
        duration: duration * 0.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: [0.33, 1, 0.68, 1] // Mobbin-like easing
      },
      transform: {
        duration: duration * 0.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: [0.33, 1, 0.68, 1]
      }
    }
  }
});

export const titleVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const highlightVariants = {
  initial: { width: 0 },
  animate: { 
    width: "100%",
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.3
    }
  }
};

export const decorationVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 0.6
    }
  }
}; 