'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useIsMobile } from "../app/hooks/useMobile";

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
// const Card3D = ({ 
//   children, 
//   depth = 10, 
//   className = "", 
//   glare = false 
// }: { 
//   children: React.ReactNode; 
//   depth?: number; 
//   className?: string; 
//   glare?: boolean;
// }) => {
//   const [rotateX, setRotateX] = useState(0);
//   const [rotateY, setRotateY] = useState(0);
//   const [scale, setScale] = useState(1);
//   const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });
//   const cardRef = useRef<HTMLDivElement>(null);

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!cardRef.current) return;
    
//     const rect = cardRef.current.getBoundingClientRect();
//     const centerX = rect.left + rect.width / 2;
//     const centerY = rect.top + rect.height / 2;
    
//     const mouseX = e.clientX;
//     const mouseY = e.clientY;
    
//     const rotateXValue = ((mouseY - centerY) / (rect.height / 2)) * -depth;
//     const rotateYValue = ((mouseX - centerX) / (rect.width / 2)) * depth;
    
//     // Calculate glare position (0-100%)
//     const glareX = ((mouseX - rect.left) / rect.width) * 100;
//     const glareY = ((mouseY - rect.top) / rect.height) * 100;
    
//     setRotateX(rotateXValue);
//     setRotateY(rotateYValue);
//     setScale(1.02);
//     setGlarePosition({ x: glareX, y: glareY });
//   };

//   const handleMouseLeave = () => {
//     setRotateX(0);
//     setRotateY(0);
//     setScale(1);
//   };

//   return (
//     <motion.div
//       ref={cardRef}
//       className={`relative transform-gpu ${className}`}
//       style={{ 
//         perspective: "1200px",
//         transformStyle: "preserve-3d"
//       }}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//     >
//       <motion.div
//         style={{ 
//           rotateX,
//           rotateY,
//           scale,
//           transformStyle: "preserve-3d",
//           transition: "all 0.15s ease-out"
//         }}
//         className="w-full h-full"
//       >
//         {children}
        
//         {/* Glare effect */}
//         {glare && (
//           <motion.div 
//             className="absolute inset-0 w-full h-full rounded-lg opacity-0 pointer-events-none"
//             style={{ 
//               background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)`,
//               opacity: scale > 1 ? 0.7 : 0,
//               transition: 'opacity 0.2s ease-out'
//             }} 
//           />
//         )}
//       </motion.div>
//     </motion.div>
//   );
// };

// // Animated stat card component
// const StatCard = ({ 
//   label, 
//   value, 
//   color = "#F89F1B", 
//   index = 0
// }: { 
//   label: string; 
//   value: string | number; 
//   color?: string; 
//   index?: number;
// }) => {
//   return (
//     <motion.div 
//       className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/5"
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ 
//         duration: 0.4, 
//         delay: 0.1 * index,
//         ease: [0.23, 1, 0.32, 1]
//       }}
//     >
//       <div className="flex items-center justify-between">
//         <div className="text-sm text-soft-white/80">{label}</div>
//         <div className="text-sm font-medium" style={{ color }}>{value}</div>
//       </div>
//     </motion.div>
//   );
// };

// Note: Since LeetCode doesn't provide a public API,
// this component uses static data or could be connected to a proxy server
// that fetches the data from your LeetCode profile

export default function LeetCodeProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
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
      <div className="h-full bg-black/60 rounded-xl p-6 relative flex flex-col">
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 sm:p-8 rounded-2xl backdrop-blur-sm border border-white/5">
      <div className="flex flex-col items-center mb-5">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F89F1B]/20 flex items-center justify-center mb-5">
          <Image 
            src="/images/leetcode-96.png" 
            alt="LeetCode" 
            width={isMobile ? 32 : 60}
            height={isMobile ? 32 : 60}
            className="object-contain"
          />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">LeetCode</h3>
          {stats && (
            <a 
              href={`https://www.leetcode.com/u/${stats.username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-white/60 hover:text-[#B8E62D] transition-colors flex items-center justify-center gap-1 mt-1"
            >
              <span>View on Leetcode</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#F89F1B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : stats && (
        <>
          <h4 className="text-lg font-medium text-white mb-4 border-b border-white/10 pb-2">Problem Solving Performance</h4>
          
          {/* Single Comprehensive Performance Card */}
          <div className="mb-8">
            <motion.div 
              className="bg-gradient-to-b from-black/60 to-black/30 p-6 rounded-xl backdrop-blur-sm border border-white/5 hover:border-[#F89F1B]/20 transition-all duration-500"
              whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(248, 159, 27, 0.1)" }}
            >
              {/* Total Problems Solved */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">{stats.solved.total}</div>
                <div className="text-sm text-gray-400">Problems Solved</div>
              </div>

              {/* Problem Distribution */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
                {/* Visual representation - donut chart style */}
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      
                      {/* Easy segment */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#00B8A3"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - (stats.solved.easy / stats.solved.total))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      
                      {/* Medium segment */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#FFB800"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - (stats.solved.medium / stats.solved.total))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{ 
                          transformOrigin: 'center',
                          transform: `rotate(${(stats.solved.easy / stats.solved.total) * 360}deg)`
                        }}
                      />
                      
                      {/* Hard segment */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#EF4743"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - (stats.solved.hard / stats.solved.total))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        style={{ 
                          transformOrigin: 'center',
                          transform: `rotate(${((stats.solved.easy + stats.solved.medium) / stats.solved.total) * 360}deg)`
                        }}
                      />
                    </svg>
                    
                    {/* Inner circle with total count */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-soft-black/40 m-10">
                      <motion.p 
                        className="text-lg sm:text-xl font-bold text-white" 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                      >
                        {stats.solved.total}
                      </motion.p>
                      <motion.p 
                        className="text-xs text-white/60 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                      >
                        Total Solved
                      </motion.p>
                    </div>
                  </div>
                </div>
                
                {/* Stats breakdown */}
                <div className="w-full lg:w-1/2 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#00B8A3] flex-shrink-0"></div>
                      <span className="text-white font-medium text-sm">Easy</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#00B8A3] font-bold text-lg">{stats.solved.easy}</span>
                      <span className="text-white/60 text-xs">({Math.round((stats.solved.easy / stats.solved.total) * 100)}%)</span>
                    </div>
                    <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#00B8A3] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.solved.easy / stats.solved.total) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#FFB800] flex-shrink-0"></div>
                      <span className="text-white font-medium text-sm">Medium</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#FFB800] font-bold text-lg">{stats.solved.medium}</span>
                      <span className="text-white/60 text-xs">({Math.round((stats.solved.medium / stats.solved.total) * 100)}%)</span>
                    </div>
                    <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#FFB800] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.solved.medium / stats.solved.total) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#EF4743] flex-shrink-0"></div>
                      <span className="text-white font-medium text-sm">Hard</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#EF4743] font-bold text-lg">{stats.solved.hard}</span>
                      <span className="text-white/60 text-xs">({Math.round((stats.solved.hard / stats.solved.total) * 100)}%)</span>
                    </div>
                    <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#EF4743] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.solved.hard / stats.solved.total) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Stats */}
          <div className="space-y-3">
            <div className="bg-gradient-to-b from-black/60 to-black/30 rounded-xl p-4 backdrop-blur-sm border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Global Ranking</span>
                <span className="text-[#F89F1B] font-medium">#{stats.ranking?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
            
            {stats.reputation !== undefined && stats.reputation > 0 && (
              <div className="bg-gradient-to-b from-black/60 to-black/30 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Reputation</span>
                  <span className={`${stats.reputation >= 0 ? 'text-[#00B8A3]' : 'text-[#EF4743]'} font-medium`}>
                    {stats.reputation >= 0 ? stats.reputation : `-${Math.abs(stats.reputation)}`}
                  </span>
                </div>
              </div>
            )}
            
            {stats.starRating !== undefined && (
              <div className="bg-gradient-to-b from-black/60 to-black/30 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Star Rating</span>
                  <span className="text-[#FFB800] font-medium">{stats.starRating}★</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <a 
              href={stats.profileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-center py-3 px-4 bg-gradient-to-b from-black/60 to-black/30 text-[#F89F1B] rounded-xl hover:from-[#F89F1B]/10 hover:to-[#F89F1B]/5 transition-all duration-300 text-sm font-medium border border-white/5 hover:border-[#F89F1B]/20"
            >
              View Full Profile
            </a>
          </div>
        </>
      )}
    </div>
  );
} 