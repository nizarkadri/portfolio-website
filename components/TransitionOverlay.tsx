'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const TransitionOverlay: React.FC = () => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [exitingRoute, setExitingRoute] = useState<string | null>(null);
  const prevPathnameRef = useRef(pathname);

  // Ensure this only runs on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track route changes and set the exiting route
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      // When route changes, the previous route is the one that's exiting
      setExitingRoute(prevPathnameRef.current);
      prevPathnameRef.current = pathname;
      
      // Clear the exiting route after transition completes
      const timer = setTimeout(() => {
        setExitingRoute(null);
      }, 2800); // Increased to match new timing
      
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Get color and name for each route
  const getRouteInfo = (path: string) => {
    if (path === '/') return { color: '#B8E62D', name: 'HOME' };
    if (path.includes('/projects')) return { color: '#8fba1f', name: 'PROJECTS' };
    if (path.includes('/experience')) return { color: '#a3cc29', name: 'EXPERIENCE' };
    if (path.includes('/about')) return { color: '#9dd127', name: 'ABOUT' };
    if (path.includes('/contact')) return { color: '#7aa61c', name: 'CONTACT' };
    return { color: '#B8E62D', name: 'LOADING' };
  };

  // Fixed particle positions to avoid hydration mismatch
  const particlePositions = [
    { left: 15, top: 20 },
    { left: 85, top: 15 },
    { left: 25, top: 80 },
    { left: 75, top: 70 },
    { left: 45, top: 30 },
    { left: 65, top: 85 },
    { left: 35, top: 60 },
    { left: 90, top: 45 }
  ];

  // Show the destination route info (current pathname) during transitions
  const routeInfo = getRouteInfo(pathname);

  // Only show overlay when there's an exiting route (during transitions)
  if (!exitingRoute) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {/* Combined overlay and route name container */}
      <motion.div
        key={`transition-${exitingRoute}-to-${pathname}`}
        className="fixed inset-0 z-[9999] pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2.8, ease: "easeInOut" }}
      >
        {/* Main overlay with route name - single animated element */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${routeInfo.color}, ${routeInfo.color}dd)`
          }}
          initial={{ 
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            opacity: 1 
          }}
          animate={{ 
            clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
            opacity: 1 
          }}
          exit={{ 
            clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
            opacity: 0 
          }}
          transition={{
            duration: 2.8,
            ease: [0.22, 1, 0.36, 1],
            delay: 1.2
          }}
        >
          {/* Route name inside the overlay */}
          <motion.h1 
            className="text-6xl md:text-8xl font-black text-black tracking-tighter"
            initial={{ 
              letterSpacing: '0.3em', 
              scale: 0.7, 
              opacity: 0,
              y: 30
            }}
            animate={{ 
              letterSpacing: ['0.3em', '0.05em', '0.05em', '0.05em'],
              scale: [0.7, 1, 1, 1],
              opacity: [0, 1, 1, 0],
              y: [30, 0, 0, -20]
            }}
            transition={{ 
              duration: 2.8,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.3, 0.7, 1]
            }}
          >
            {routeInfo.name}
          </motion.h1>
        </motion.div>

        {/* Animated particles - only on client */}
        {isClient && (
          <div className="absolute inset-0 overflow-hidden">
            {particlePositions.map((position, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-black/40"
                style={{
                  left: `${position.left}%`,
                  top: `${position.top}%`,
                }}
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{ 
                  opacity: [0, 0.8, 0.8, 0], 
                  scale: [0, 1.8, 1.8, 0],
                  rotate: [0, 180, 360, 540],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (40 + i * 12), (i % 2 === 0 ? 1 : -1) * (80 + i * 15)],
                  y: [0, (i % 3 === 0 ? -1 : 1) * (25 + i * 8), (i % 3 === 0 ? -1 : 1) * (50 + i * 10)]
                }}
                transition={{
                  duration: 2.8,
                  delay: 0.2 + i * 0.12,
                  ease: "easeInOut",
                  times: [0, 0.3, 0.7, 1]
                }}
              />
            ))}
          </div>
        )}

        {/* Secondary wipe effect */}
        <motion.div
          className="absolute inset-0 bg-black/20"
          initial={{ x: '100%', skewX: 0 }}
          animate={{ x: '-100%', skewX: 15 }}
          exit={{ x: '-100%', skewX: 15 }}
          transition={{
            duration: 1.2,
            delay: 1.4,
            ease: [0.83, 0, 0.17, 1]
          }}
        />

        {/* Additional accent line */}
        <motion.div
          className="absolute top-1/2 left-0 w-full h-2 transform -translate-y-1/2"
          style={{ backgroundColor: routeInfo.color }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: [0, 1, 1, 0] }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{
            duration: 1.8,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.3, 0.6, 1]
          }}
        />

        {/* Pulsing background effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${routeInfo.color}20, transparent 70%)`
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: [0, 0.6, 0.6, 0],
            scale: [0.5, 1.2, 1.2, 1.5]
          }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{
            duration: 2.8,
            delay: 0.1,
            ease: "easeInOut",
            times: [0, 0.3, 0.7, 1]
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default TransitionOverlay; 