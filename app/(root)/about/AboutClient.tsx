'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView, Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import ParallaxImage from '../../../components/ParallaxImage';  
import { useIsMobile } from "../../../app/hooks/useMobile";
import AnimatedText from '../../../components/AnimatedText';
import Image from 'next/image';
import MyStory from '../../../components/MyStory';

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
  const fadeOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleTitle = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.3, 1]);
  const yTitle = useTransform(scrollYProgress, [0, 0.2], [0, 300]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const backgroundImageFixed = useTransform(scrollYProgress, [0,1], ['0%', '100%']);
  const isMainContentInView = useInView(mainContentRef, { once: true, margin: "-100px" });
  const isProfilesInView = useInView(profilesRef, { once: false, margin: "-100px" });
  const isPhilosophyInView = useInView(philosophyRef, { once: false, margin: "-100px" });

  return (
    <>
    {isMobile? (
     <motion.div
     className="absolute inset-0"
     style={{
       backgroundImage: "url('/images/about-bg-mobile.png')" ,
       backgroundAttachment: 'fixed',
       backgroundPosition: 'right',
       backgroundRepeat: 'no-repeat',
       backgroundSize: 'contain',
     }}
   />
    ):(
      <motion.div 
    className="fixed inset-0 z-[-1] w-full h-full"
    style={{ y: backgroundImageFixed }}
    >
          <Image
            src="/images/about-bg.png"
            alt="City skyline background"
            fill
            
            className="object-contain object-top"
            
            quality={100}
            priority={true} // <-- This is the key to preventing the loading glitch
          />
        </motion.div>
     
    )}
    <div className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{ y: backgroundY }}
      >
        <FloatingDecoration delay={0} size="w-6 h-6" position="top-20 left-[10%]" />
        <FloatingDecoration delay={2} size="w-4 h-4" position="top-40 right-[15%]" />
        <FloatingDecoration delay={4} size="w-8 h-8" position="top-60 left-[80%]" />
        <FloatingDecoration delay={1} size="w-3 h-3" position="bottom-40 left-[20%]" />
        <FloatingDecoration delay={3} size="w-5 h-5" position="bottom-60 right-[25%]" />
        <FloatingDecoration delay={5} size="w-4 h-4" position="top-[70%] right-[5%]" />
      </motion.div>

    

      {/* Main Content Section */}
      <section className="relative min-h-screen overflow-hidden ">

        {/* City Map Background for Main Content */}
        
        
        {/* Dark overlay for text readability */}
        <motion.div 
          className="absolute inset-0 bg-black/75 z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
         
        />
         <motion.div 
          className="absolute inset-0 bg-black/40 z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        />
        
        {/* Portrait Image with Parallax - Left Panel */}
        
        <motion.div 
          className="relative z-[2]"
          initial={{ 
            
            opacity: 0 
          }}
          animate={{ 
            opacity: 1 
          }}
          transition={{ 
            duration: 1.5,
            ease:"easeInOut",
            // ease: [0.25, 0.46, 0.45, 0.94],
            delay: 1.0
          }}
          
        >

          
          <ParallaxImage image={isMobile ? "/images/Potraits/potrait-1.jpg" : "/images/Potraits/potrait-2.png"} isMobile={isMobile} />
          
            {/* Hero Title Overlay */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-end z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              // style={{ opacity: fadeOpacity,
              //    scale: scaleTitle }}

            >
              <div className="text-center pr-20 pt-80 md:pt-0 md:px-40 md:grid md:grid-cols-2 md:gap-10">
                <div className="col-span-1"></div>
                {/* Staggered Text Reveal - "About" */}
                <motion.div className="col-span-1">
                  <motion.div
                  style={{ opacity: fadeOpacity,
                    scale: scaleTitle,
                    y: yTitle,
                   }}
                  >
                    <AnimatedText
                      el="h1"
                      className="text-6xl md:text-8xl lg:text-9xl font-montserrat text-[#B0B0A7] mb-4 tracking-tight  "
                      delay={1.5}
                      stagger={0.16}
                    >
                      Hello<span className="text-[#B8E62D]">! </span> 
                    </AnimatedText>
                  </motion.div>
                
                  <motion.div
                  style={{ opacity: fadeOpacity,
                    scale: scaleTitle,
                    y: yTitle }}
                  >
                <AnimatedText  
                el="h1" 
                className=" text-6xl md:text-8xl lg:text-9xl font-montserrat text-[#B0B0A7] mb-4 tracking-tight" 
                delay={2.0} 
                stagger={0.20}
                >
                  I am
                </AnimatedText>
                </motion.div>
                <motion.div
                  style={{ opacity: fadeOpacity,
                    scale: scaleTitle,
                    y: yTitle }}
                  > 
                <AnimatedText  
                el="h1" 
                className=" text-6xl md:text-9xl lg:text-9xl font-montserrat text-[#B8E62D] tracking-tight " 
                delay={2.3} 
                stagger={0.08} >
                  Nizar
                </AnimatedText>
                </motion.div>
                {isMobile?
                <>
                <motion.div
                  style={{ opacity: fadeOpacity,
                    scale: scaleTitle,
                    y: yTitle }}
                  > 
                <AnimatedText el="p" className="text-lg md:text-2xl pt-10 text-[#B0B0A7]   max-w-2xl mx-auto leading-relaxed font-light" 
                 delay={2.0} 
                stagger={0.02} >
                  Full Stack Software Engineer
                </AnimatedText>
                <AnimatedText el="p" className="text-lg md:text-2xl text-[#B0B0A7] max-w-2xl mx-auto leading-relaxed font-light"
                 delay={2.0} 
                stagger={0.02} >
                  Based in Toronto, Canada
                </AnimatedText>
                </motion.div>
                </>
                :
                <motion.div
                  style={{ opacity: fadeOpacity,
                    scale: scaleTitle,
                    y: yTitle }}
                  > 
                <AnimatedText el="p" className="text-lg md:text-2xl pt-20 text-[#B0B0A7] max-w-2xl mx-auto leading-relaxed font-light" 
                delay={2.0} 
                stagger={0.02} >
                Full Stack Software Engineer<span className="text-[#B8E62D]"> • </span>Based in Toronto, Canada
                </AnimatedText>
                </motion.div>
                }
                </motion.div>
                  
                
              </div>
            </motion.div>
                
            {/* Enhanced Gradient Overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
            />
          {/* </ParallaxImage> */}
        </motion.div>
        
        {/* Content Container */}
        <div className="relative mt-20 container mx-auto px-4 py-20">
          
          {/* About Introduction */}
          <MyStory />
         

          {/* Beyond Work & Philosophy moved into MyStory to keep single scroll context */}
        </div>
      </section>
    </div>
    </>
  );
};

export default AboutClient; 