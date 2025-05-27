'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import useIsMobile from '../lib/useIsMobile'; // Import useIsMobile

type LeetCodeStats = {
  username: string;
  profileUrl: string;
  solved: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  };
  ranking: number;
  reputation?: number;
  starRating?: number;
  avatar?: string;
};

// 3D Card component that responds to mouse movement
const Card3D = ({ 
  children, 
  depth = 10, 
  className = "", 
  glare = false 
}: { 
  children: React.ReactNode; 
  depth?: number; 
  className?: string; 
  glare?: boolean;
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobileHook = useIsMobile(); // Use hook

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobileHook || !cardRef.current || depth === 0) return; // Disable on mobile or if depth is 0
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const rotateXValue = ((mouseY - centerY) / (rect.height / 2)) * -depth;
    const rotateYValue = ((mouseX - centerX) / (rect.width / 2)) * depth;
    
    // Calculate glare position (0-100%)
    const glareX = ((mouseX - rect.left) / rect.width) * 100;
    const glareY = ((mouseY - rect.top) / rect.height) * 100;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setScale(1.02);
    setGlarePosition({ x: glareX, y: glareY });
  };

  const handleMouseLeave = () => {
    if (isMobileHook || depth === 0) return; // Disable on mobile or if depth is 0
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative transform-gpu ${className}`}
      style={{ 
        perspective: "1200px",
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={!(isMobileHook || depth === 0) ? { 
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          transition: "all 0.15s ease-out"
        } : {
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full"
      >
        {children}
        
        {/* Glare effect */}
        {glare && !isMobileHook && ( // Disable glare on mobile
          <motion.div 
            className="absolute inset-0 w-full h-full rounded-lg opacity-0 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)`,
              opacity: scale > 1 ? 0.7 : 0, 
              transition: 'opacity 0.2s ease-out'
            }} 
          />
        )}
      </motion.div>
    </motion.div>
  );
};

// Animated stat card component
const StatCard = ({ 
  label, 
  value, 
  color = "#F89F1B", 
  index = 0,
  isMobile // Added isMobile prop
}: { 
  label: string; 
  value: string | number; 
  color?: string; 
  index?: number;
  isMobile?: boolean;
}) => {
  return (
    <motion.div 
      className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/5"
      initial={isMobile ? {opacity:1, y:0} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={isMobile ? {duration:0} : { 
        duration: 0.4, 
        delay: 0.1 * index,
        ease: [0.23, 1, 0.32, 1]
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-soft-white/80">{label}</div>
        <div className="text-sm font-medium" style={{ color }}>{value}</div>
      </div>
    </motion.div>
  );
};

// Note: Since LeetCode doesn't provide a public API,
// this component uses static data or could be connected to a proxy server
// that fetches the data from your LeetCode profile

export default function LeetCodeProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile(); // Initialize useIsMobile
  
  useEffect(() => {
    const fetchLeetCodeStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/leetcode');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch LeetCode data');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching LeetCode stats:', err);
        setError(err instanceof Error ? err.message : 'Could not load LeetCode stats');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeetCodeStats();
  }, []);

  if (error) {
    return (
      <div className="h-full bg-[#141414] rounded-xl p-6 relative flex flex-col">
        <div className="flex items-center mb-6">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-[#F89F1B]/20 flex items-center justify-center mr-4">
            <Image 
              src="/images/leetcode-icon.png" 
              alt="LeetCode" 
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">LeetCode</h3>
            <a 
              href="https://leetcode.com/nizarkadri/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#F89F1B] hover:underline"
            >
              @nizarkadri
            </a>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-400 py-4">
            {error}
            <motion.button 
              onClick={() => {
                setIsLoading(true);
                setError(null);
                fetch('/api/leetcode')
                  .then(res => res.json())
                  .then(data => {
                    setStats(data);
                    setIsLoading(false);
                  })
                  .catch(err => {
                    setError(err instanceof Error ? err.message : 'Failed to fetch data');
                    setIsLoading(false);
                  });
              }}
              className="block mx-auto mt-4 px-4 py-2 bg-[#F89F1B]/10 text-[#F89F1B] rounded hover:bg-[#F89F1B]/20 text-sm"
              whileHover={!isMobile ? { scale: 1.05 } : {}}
              whileTap={!isMobile ? { scale: 0.95 } : {}}
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#141414] rounded-xl p-4 sm:p-6 relative flex flex-col">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-[#F89F1B]/20 flex items-center justify-center mr-3 sm:mr-4 shrink-0">
          <Image 
            src="/images/leetcode-icon.png" 
            alt="LeetCode" 
            width={32} // Will be contained by parent
            height={32} // Will be contained by parent
            className="w-5 h-5 sm:w-6 sm:h-6 object-contain" // Responsive icon size via classes
          />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">LeetCode</h3>
          {stats && (
            <div className="flex items-center">
              <a 
                href={stats.profileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm sm:text-base text-[#F89F1B] hover:underline"
              >
                @{stats.username}
              </a>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#F89F1B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : stats && (
        <>
          <div className="mt-1 sm:mt-2 mb-4 sm:mb-6 text-right">
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.solved.total}</div>
            <div className="text-xs sm:text-sm text-gray-400">Problems Solved</div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="bg-[#1e1e1e] rounded-md p-2 sm:p-3 text-center border border-[rgba(255,255,255,0.05)]">
              <div className="text-base sm:text-lg font-semibold text-[#00B8A3]">{stats.solved.easy}</div>
              <div className="text-xs text-gray-400">Easy</div>
            </div>
            <div className="bg-[#1e1e1e] rounded-md p-2 sm:p-3 text-center border border-[rgba(255,255,255,0.05)]">
              <div className="text-base sm:text-lg font-semibold text-[#FFB800]">{stats.solved.medium}</div>
              <div className="text-xs text-gray-400">Medium</div>
            </div>
            <div className="bg-[#1e1e1e] rounded-md p-2 sm:p-3 text-center border border-[rgba(255,255,255,0.05)]">
              <div className="text-base sm:text-lg font-semibold text-[#EF4743]">{stats.solved.hard}</div>
              <div className="text-xs text-gray-400">Hard</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm sm:text-base text-white font-medium mb-2 sm:mb-3">Latest Activities</h4>
            <div className="space-y-2">
              <div className="bg-[#1e1e1e] rounded-md p-2 sm:p-3 flex justify-between items-center border border-[rgba(255,255,255,0.05)]">
                <span className="text-xs sm:text-sm text-gray-400">Global Ranking</span>
                <span className="text-xs sm:text-sm text-[#F89F1B] font-medium">#{stats.ranking?.toLocaleString() || 'N/A'}</span>
              </div>
              
              {stats.reputation !== undefined && (
                <div className="bg-[#1e1e1e] rounded-md p-2 sm:p-3 flex justify-between items-center border border-[rgba(255,255,255,0.05)]">
                  <span className="text-xs sm:text-sm text-gray-400">Reputation</span>
                  <span className={`text-xs sm:text-sm ${stats.reputation >= 0 ? 'text-[#00B8A3]' : 'text-[#EF4743]'} font-medium`}>
                    {stats.reputation >= 0 ? stats.reputation : `-${Math.abs(stats.reputation)}`}
                  </span>
                </div>
              )}
              
              {stats.starRating !== undefined && (
                <div className="bg-[#1e1e1e] rounded-md p-2 sm:p-3 flex justify-between items-center border border-[rgba(255,255,255,0.05)]">
                  <span className="text-xs sm:text-sm text-gray-400">Star Rating</span>
                  <span className="text-xs sm:text-sm text-[#FFB800] font-medium">{stats.starRating}★</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-3 sm:pt-4">
            <a 
              href={stats.profileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-center py-2 px-3 text-xs sm:py-2.5 sm:px-4 sm:text-sm bg-[#1e1e1e] text-[#F89F1B] rounded-md hover:bg-[#2a2a2a] transition-colors font-medium border border-[rgba(255,255,255,0.05)]"
            >
              View Full Profile
            </a>
          </div>
        </>
      )}
    </div>
  );
} 