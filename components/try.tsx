'use client';

import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const Logo3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rotateX = useMotionValue(15);
    const rotateY = useMotionValue(15);
  
    // Transform values for 3D effect
    const z = useTransform(rotateX, [-40, 40], [8, -8]);
    
    return (
      <motion.div 
        ref={containerRef}
        className="relative w-80 h-80 perspective-[800px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* The cube */}
        <motion.div
          className="w-full h-full absolute transform-style-3d"
          style={{
            rotateX: 15,
            rotateY: 15,
            z: 0,
            transformStyle: "preserve-3d"
          }}
          animate={{ rotateZ: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {/* Front face - Fullstack */}
          <motion.div
            className="absolute w-full h-full flex items-center justify-center bg-[#111111] border-2 border-[#8acea2]/30"
            style={{
              transform: "translateZ(40px)",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="text-center">
              <span className="font-black text-5xl md:text-6xl text-white">FULL<span className="text-[#8acea2]">STACK</span></span>
              <div className="mt-2 text-white/60 text-sm">Engineer</div>
            </div>
          </motion.div>
          
          {/* Back face - DevOps */}
          <motion.div
            className="absolute w-full h-full flex items-center justify-center bg-[#111111] border-2 border-[#8acea2]/30"
            style={{
              transform: "rotateY(180deg) translateZ(40px)",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="text-center">
              <span className="font-black text-5xl md:text-6xl text-[#8acea2]">DEV<span className="text-white">OPS</span></span>
              <div className="mt-2 text-white/60 text-sm">Solutions</div>
            </div>
          </motion.div>
          
          {/* Left face - Frontend */}
          <motion.div
            className="absolute w-full h-full flex items-center justify-center bg-[#111111] border-2 border-[#8acea2]/30"
            style={{
              transform: "rotateY(-90deg) translateZ(40px)",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="text-center">
              <span className="font-black text-5xl md:text-6xl text-white">FRONT<span className="text-[#8acea2]">END</span></span>
              <div className="mt-2 text-white/60 text-sm">Development</div>
            </div>
          </motion.div>
          
          {/* Right face - Backend */}
          <motion.div
            className="absolute w-full h-full flex items-center justify-center bg-[#111111] border-2 border-[#8acea2]/30"
            style={{
              transform: "rotateY(90deg) translateZ(40px)",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="text-center">
              <span className="font-black text-5xl md:text-6xl text-[#8acea2]">BACK<span className="text-white">END</span></span>
              <div className="mt-2 text-white/60 text-sm">Architecture</div>
            </div>
          </motion.div>
          
          {/* Top face - Initials */}
          <motion.div
            className="absolute w-full h-full flex items-center justify-center bg-[#111111] border-2 border-[#8acea2]/30"
            style={{
              transform: "rotateX(90deg) translateZ(40px)",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="text-center">
              <span className="font-black text-6xl md:text-7xl text-[#8acea2]">N<span className="text-white">K</span></span>
              <div className="mt-2 text-white/60 text-sm">Portfolio</div>
            </div>
          </motion.div>
          
          {/* Bottom face - Software Engineer */}
          <motion.div
            className="absolute w-full h-full flex items-center justify-center bg-[#111111] border-2 border-[#8acea2]/30"
            style={{
              transform: "rotateX(-90deg) translateZ(40px)",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="text-center">
              <span className="font-black text-4xl md:text-5xl text-white">SOFT<span className="text-[#8acea2]">WARE</span></span>
              <div className="mt-2 text-white/60 text-sm">Engineer</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };