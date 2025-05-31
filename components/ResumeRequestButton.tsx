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

  return (
    <motion.div
      className="fixed top-8 right-[40%] transform -translate-x-1/3 z-50 group cursor-pointer md:top-8 md:right-8"
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
      {/* Main magical button */}
      <motion.button  
        className="relative w-20 h-8 bg-transparent text-white font-medium text-xs rounded-full border border-[#B8E62D]/70 border-2"
        whileTap={{ 
          scale: 0.95,
          borderColor: "white",
          borderBlockColor: "yellow",
          borderBlockEndColor: "#B8E62D",
          transition: { duration: 0.1 }
        }}
        whileHover={{
          scale: 1.05,
          borderColor: "white",
          borderBlockColor: "yellow",
          borderBlockEndColor: "#B8E62D",
          
        }}
        
      >
        
        <motion.span 
          className="relative z-10 flex items-center justify-center h-full">
         
        
           Resume
        </motion.span>

        {/* Hover fill effect */}
        
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