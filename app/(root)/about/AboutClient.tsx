'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView, Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import ParallaxImage from '../../../components/ParallaxImage';  
import { useIsMobile } from "../../../app/hooks/useMobile";

// Dynamically import the components with SSR disabled since they use browser APIs
const ChessProfile = dynamic(() => import('../../../components/ChessProfile'), { ssr: false });
const DuolingoProfile = dynamic(() => import('../../../components/DuolingoProfile'), { ssr: false });
const LeetCodeProfile = dynamic(() => import('../../../components/LeetCodeProfile'), { ssr: false });

// TypeScript interfaces
interface FloatingDecorationProps {
  delay?: number;
  size?: string;
  position?: string;
}

// Animation variants with proper typing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const floatingVariants: Variants = {
  initial: {
    y: 0,
    rotate: 0,
    opacity: 1
  },
  animate: {
    y: [-10, 10, -10],
    rotate: [-1, 1, -1],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const profileCardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    y: -10,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Floating decoration component with proper TypeScript
const FloatingDecoration: React.FC<FloatingDecorationProps> = ({ 
  delay = 0, 
  size = "w-4 h-4", 
  position = "top-10 left-10" 
}) => (
  <motion.div
    className={`absolute ${position} ${size} bg-[#B8E62D]/20 rounded-full blur-sm`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.3, 0.7, 0.3],
      scale: [1, 1.2, 1],
      y: [-20, 20, -20]
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

const AboutClient: React.FC = () => {
  const isMobile = useIsMobile();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const profilesRef = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const cityBackgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  
  const isMainContentInView = useInView(mainContentRef, { once: true, margin: "-100px" });
  const isProfilesInView = useInView(profilesRef, { once: true, margin: "-100px" });
  const isPhilosophyInView = useInView(philosophyRef, { once: true, margin: "-100px" });
  
  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ y: backgroundY }}
      >
        <FloatingDecoration delay={0} size="w-6 h-6" position="top-20 left-[10%]" />
        <FloatingDecoration delay={2} size="w-4 h-4" position="top-40 right-[15%]" />
        <FloatingDecoration delay={4} size="w-8 h-8" position="top-60 left-[80%]" />
        <FloatingDecoration delay={1} size="w-3 h-3" position="bottom-40 left-[20%]" />
        <FloatingDecoration delay={3} size="w-5 h-5" position="bottom-60 right-[25%]" />
        <FloatingDecoration delay={5} size="w-4 h-4" position="top-[70%] right-[5%]" />
      </motion.div>

      {/* Hero Section with Parallax Image and Overlay Title */}
      <section className="relative h-screen overflow-hidden">
        {/* City Map Parallax Background */}
        <motion.div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            y: cityBackgroundY,
            backgroundImage: "url('/images/about-bg.png')",
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
        
        {/* Dark overlay for better contrast */}
        <motion.div 
          className="absolute inset-0 bg-black/40 z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Portrait Image with Parallax */}
        <div className="relative z-[2]">
          <ParallaxImage image="/images/Potraits/IMG-20250411-WA0021.jpg" isMobile={isMobile}>
            {/* Hero Title Overlay */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="text-center px-4">
                <motion.h1 
                  className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-4 tracking-tight hero-title-stroke"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    textShadow: '0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6)',
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  About
                </motion.h1>
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <motion.h2 
                    className="text-5xl md:text-7xl lg:text-8xl font-black text-[#B8E62D] tracking-tight"
                    style={{
                      textShadow: '0 0 20px rgba(184, 230, 45, 0.5), 0 0 40px rgba(184, 230, 45, 0.3)',
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                  >
                    Me
                  </motion.h2>
                  <motion.div 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#B8E62D] rounded-full"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 64, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
                  />
                </motion.div>
                
                {/* Subtitle */}
                <motion.p 
                  className="mt-8 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                  >
                    Developer
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                  >
                    {" • "}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.7, duration: 0.5 }}
                  >
                    Problem Solver
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.9, duration: 0.5 }}
                  >
                    {" • "}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.1, duration: 0.5 }}
                  >
                    Lifelong Learner
                  </motion.span>
                </motion.p>
              </div>
            </motion.div>
            
            {/* Enhanced Gradient Overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </ParallaxImage>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* City Map Background for Main Content */}
        <motion.div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: "url('/images/about-bg.png')",
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
        
        {/* Dark overlay for text readability */}
        <motion.div 
          className="absolute inset-0 bg-black/75 z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Content Container */}
        <div className="relative z-[2] container mx-auto px-4 py-20">
          
          {/* About Introduction */}
          <motion.div 
            ref={mainContentRef}
            className="max-w-4xl mx-auto text-center mb-20"
            variants={containerVariants}
            initial="hidden"
            animate={isMainContentInView ? "visible" : "hidden"}
          >
            <motion.h3 
              className="text-2xl md:text-3xl font-semibold text-white mb-6"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                color: "#B8E62D",
                transition: { duration: 0.3 }
              }}
            >
              Who <span className="text-[#B8E62D]">I Am</span>
            </motion.h3>
            <motion.p 
              className="text-lg md:text-xl text-gray-300 leading-relaxed"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                color: "#ffffff",
                transition: { duration: 0.3 }
              }}
            >
              I&apos;m a passionate developer who believes in continuous learning and growth. 
              When I&apos;m not coding, you&apos;ll find me exploring new challenges and pushing my limits 
              in various pursuits.
            </motion.p>
          </motion.div>

          {/* Beyond Work Section */}
          <motion.div
            ref={profilesRef}
            variants={containerVariants}
            initial="hidden"
            animate={isProfilesInView ? "visible" : "hidden"}
          >
            {/* Section Header */}
            <motion.div className="text-center mb-16" variants={itemVariants}>
              <motion.h2 
                className="text-3xl md:text-5xl font-bold text-white mb-4"
                whileHover={{ 
                  scale: 1.05,
                  textShadow: "0 0 20px rgba(184, 230, 45, 0.3)",
                  transition: { duration: 0.3 }
                }}
              >
                Beyond <span className="text-[#B8E62D]">Work</span>
              </motion.h2>
              <motion.div 
                className="w-24 h-1 bg-[#B8E62D] mx-auto mb-6 rounded-full"
                initial={{ width: 0, opacity: 0 }}
                animate={isProfilesInView ? { width: 96, opacity: 1 } : { width: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              />
              <motion.p 
                className="text-gray-400 text-lg max-w-2xl mx-auto"
                variants={itemVariants}
                whileHover={{ 
                  color: "#ffffff",
                  transition: { duration: 0.3 }
                }}
              >
                Here&apos;s what keeps me motivated and challenged outside of development
              </motion.p>
            </motion.div>

            {/* Profiles Grid with Enhanced Animations */}
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
              variants={containerVariants}
            >
              <motion.div
                className="preserve-3d"
                variants={profileCardVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  variants={floatingVariants}
                  initial="initial"
                  animate="animate"
                >
                  <ChessProfile />
                </motion.div>
              </motion.div>
              
              <motion.div
                className="preserve-3d"
                variants={profileCardVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  variants={floatingVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 2 }}
                >
                  <DuolingoProfile />
                </motion.div>
              </motion.div>
              
              <motion.div
                className="md:col-span-2 lg:col-span-1 preserve-3d"
                variants={profileCardVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  variants={floatingVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 4 }}
                >
                  <LeetCodeProfile />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Personal Philosophy Section */}
          <motion.div 
            ref={philosophyRef}
            className="max-w-4xl mx-auto text-center mt-20 pt-20 border-t border-gray-800 relative"
            variants={containerVariants}
            initial="hidden"
            animate={isPhilosophyInView ? "visible" : "hidden"}
          >
            {/* Decorative elements around philosophy section */}
            <motion.div
              className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-[#B8E62D] to-transparent rounded-full"
              initial={{ width: 0, opacity: 0 }}
              animate={isPhilosophyInView ? { width: 80, opacity: 1 } : { width: 0, opacity: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
            
            <motion.h3 
              className="text-2xl md:text-3xl font-semibold text-white mb-6"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                textShadow: "0 0 15px rgba(184, 230, 45, 0.3)",
                transition: { duration: 0.3 }
              }}
            >
              My <span className="text-[#B8E62D]">Philosophy</span>
            </motion.h3>
            <motion.p 
              className="text-gray-300 text-lg leading-relaxed"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                color: "#ffffff",
                transition: { duration: 0.3 }
              }}
            >
              I believe that growth happens at the intersection of challenge and curiosity. 
              Whether it&apos;s solving complex algorithms, mastering a new language, or calculating 
              the perfect chess move, each pursuit teaches me something valuable that I bring 
              back to my development work.
            </motion.p>
            
            {/* Animated quote marks */}
            <motion.div
              className="flex justify-center mt-8 space-x-4"
              variants={itemVariants}
            >
              <motion.div
                className="text-[#B8E62D] text-4xl opacity-30"
                animate={{ 
                  rotate: [0, 5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                &ldquo;
              </motion.div>
              <motion.div
                className="text-[#B8E62D] text-4xl opacity-30"
                animate={{ 
                  rotate: [0, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                &rdquo;
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutClient; 