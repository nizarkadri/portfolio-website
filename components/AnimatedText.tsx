import React, { ElementType } from 'react'; // Import ElementType
import { motion, Variants } from 'framer-motion';

/**
 * Props for the AnimatedText component.
 */
type AnimatedTextProps = {
  children: React.ReactNode;
  /**
   * The component or HTML tag to use for the wrapper.
   * Can be 'h1', 'p', or even a custom component.
   * @default 'p'
   */
  el?: ElementType; // This is the key change
  className?: string;
  delay?: number;
  stagger?: number;
};

/**
 * A component that reveals text character by character.
 */
const AnimatedText = ({
  children,
  el: Wrapper = 'p', // Default to a <p> tag
  className,
  delay = 0,
  stagger = 0.05,
}: AnimatedTextProps) => {

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const characterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: '0.5em',
    },
    visible: {
      opacity: 1,
      y: '0em',
      transition: {
        type: 'spring',
        damping: 42,
        stiffness: 10,
      },
    },
  };

  const characters = React.Children.toArray(children).flatMap((child) =>
    typeof child === 'string' ? child.split('') : child
  );

  return (
    <Wrapper className={className}>
      <span className="sr-only">{children}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {characters.map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            variants={characterVariants}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    </Wrapper>
  );
};

export default AnimatedText;