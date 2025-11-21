'use client'

import { motion } from 'framer-motion';

interface ResumeRequestButtonProps {
  onClick: () => void;
}

const ResumeRequestButton = ({ onClick }: ResumeRequestButtonProps) => {
  // Fixed positions to avoid hydration mismatch
  // const particlePositions = [
  //   { top: '30%', left: '20%' },
  //   { top: '60%', left: '70%' },
  //   { top: '45%', left: '15%' },
  //   { top: '35%', left: '80%' }
  // ];

  const connectFillVariants = {
    rest: { scaleX: 0, opacity: 0.25 },
    hover: { scaleX: 1, opacity: 0.6 },
    tap: { scaleX: 1.05, opacity: 0.7 }
  };

  const connectSheenVariants = {
    rest: { x: '-60%', opacity: 0 },
    hover: { x: '60%', opacity: 0.5 },
    tap: { x: '80%', opacity: 0.6 }
  };

  const connectHaloVariants = {
    rest: { opacity: 0.3, scale: 1 },
    hover: { opacity: 0.65, scale: 1.06 },
    tap: { opacity: 0.8, scale: 1.1 }
  };

  const connectTextVariants = {
    rest: { letterSpacing: '0.32em', color: '#F8FFE0', opacity: 0.85 },
    hover: { letterSpacing: '0.38em', color: '#FFFFFF', opacity: 1 },
    tap: { letterSpacing: '0.36em', color: '#C9FFD2', opacity: 0.95 }
  };

  const connectUnderlineVariants = {
    rest: { width: '0%', opacity: 0 },
    hover: { width: '60%', opacity: 0.55 },
    tap: { width: '75%', opacity: 0.75 }
  };

  const connectButtonVariants = {
    rest: { 
      scale: 1,
      borderColor: "rgba(208,255,156,0.35)"
    },
    hover: { 
      borderColor: "rgba(255,255,255,0.4)",
      scale: 1.02
    },
    tap: { 
      borderColor: "rgba(184,230,45,0.8)",
      scale: 0.95
    }
  };

  return (
    <motion.div
      className="fixed top-8 right-[40%] transform -translate-x-1/3 z-[60] group cursor-pointer md:top-8 md:right-8"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        delay: 1.8,
        type: "spring",
        bounce: 0.4
      }}
      onClick={onClick}
    >
      {/* Main minimalist button */}
      <motion.button  
        className="relative w-[6.1rem] h-9 rounded-full border border-[#D0FF9C]/35 bg-[#020604]/60 backdrop-blur-md text-white uppercase tracking-[0.32em] text-[0.65rem] font-semibold overflow-hidden shadow-[0_0_18px_rgba(67,255,196,0.35)]"
        variants={connectButtonVariants}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap="tap"
      >
        <motion.div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-1 left-2 right-2 rounded-full bg-gradient-to-r from-[#16290B] via-[#0E4122] to-[#0A4A4E]"
            style={{ transformOrigin: "left center" }}
            variants={connectFillVariants}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent blur-sm"
            variants={connectSheenVariants}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-full border border-[#B8E62D]/50 shadow-[0_0_20px_rgba(184,230,45,0.35)]"
          variants={connectHaloVariants}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />
        <motion.span 
          className="relative z-10 flex items-center justify-center h-full drop-shadow-[0_4px_10px_rgba(10,10,10,0.7)]"
          variants={connectTextVariants}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
           CONNECT
        </motion.span>
        <motion.div
          className="absolute bottom-[3px] left-1/2 -translate-x-1/2 h-[1px] rounded-full bg-gradient-to-r from-transparent via-[#D0FF9C] to-transparent"
          variants={connectUnderlineVariants}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />

        {/* Click ripple effect */}
        <motion.div
          className="absolute inset-0 bg-[#B8E62D]/40 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ 
            scale: [1, 1.5],
            opacity: [0, 1],
            transition: { 
              duration: 0.4, 
              ease: "easeOut"
            }
          }}
          style={{ transformOrigin: "center" }}
        />
        
      </motion.button>
      
      
      {/* Simple orbiting dots */}
      <motion.div
        className="absolute inset-0 w-20 h-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3"
            style={{
              top: `${50 + (i**(i-1))}%`,
              left: `${50 + (i**(i-2))}%`,
              transform: `translate(-50%, -50%) rotate(${i * 180}deg) translateY(-18px)`,
            }}
          >
            <motion.div
              className="w-1 h-1 bg-gray-500/90 rounded-full"
              animate={{
                scale: [0.8, 1, 0.8],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                repeatType: "reverse"
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    
      
     
     
    </motion.div>
  );
};

export default ResumeRequestButton; 