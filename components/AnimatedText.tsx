import React from 'react';
import { motion } from 'framer-motion';

// Letter variants remain unchanged as they are not dynamic
const letterVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
};

const AnimatedTypography = ({ text, className, delay = 0, staggerAmount = 0.15 }: { text: string, className: string, delay?: number, staggerAmount?: number }) => {
  // Move container variants inside the component to access the delay prop
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerAmount,
        delayChildren: delay, // Use the delay prop here
      },
    },
  };

  const letters = Array.from(text);

  return (
    <motion.h1
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};

// EXAMPLE USAGE:
// import AnimatedTypography from './AnimatedTypography';
// <AnimatedTypography text="This animation starts after 1.5 seconds." delay={1.5} />

export default AnimatedTypography;