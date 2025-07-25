'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useIsMobile } from '../app/hooks/useMobile';
import Image from 'next/image';
interface GameTypeStats {
  last: {
    rating: number;
    date: number;
    rd: number;
  };
  best: {
    rating: number;
    date: number;
    game: string;
  };
  record: {
    win: number;
    loss: number;
    draw: number;
    time_per_move: number;
    timeout_percent: number;
  };
}

interface ChessStats {
  username: string;
  avatar?: string;
  rapid?: GameTypeStats;
  blitz?: GameTypeStats;
  bullet?: GameTypeStats;
  tactics?: {
    highest: {
      rating: number;
      date: number;
    };
    lowest: {
      rating: number;
      date: number;
    };
  };
  fideRating?: number;
}

// // 3D Card wrapper component
// const Card3D = ({ children, depth = 10, className = "" }: { children: React.ReactNode, depth?: number, className?: string }) => {
//   const [rotateX, setRotateX] = useState(0);
//   const [rotateY, setRotateY] = useState(0);
//   const [scale, setScale] = useState(1);
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
    
//     setRotateX(rotateXValue);
//     setRotateY(rotateYValue);
//     setScale(1.02);
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
//       >
//         {children}
//       </motion.div>
//     </motion.div>
//   );
// };

// const GameTypeCard = ({ type, stats, isActive, onClick, index }: { 
//   type: string; 
//   stats?: GameTypeStats; 
//   isActive: boolean;
//   onClick: () => void;
//   index: number;
// }) => {
//   if (!stats) return null;
  
//   const totalGames = stats.record.win + stats.record.loss + stats.record.draw;
//   const winRate = totalGames > 0 ? Math.round((stats.record.win / totalGames) * 100) : 0;
  
//   return (
//     <Card3D depth={7} className="cursor-pointer">
//       <motion.div 
//         className={`rounded-lg p-4 backdrop-blur-sm transition-all ${
//           isActive 
//             ? "bg-white/15 border border-white/20 shadow-lg shadow-white/5" 
//             : "bg-white/5 hover:bg-white/10"
//         }`}
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4, delay: index * 0.1 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={onClick}
//       >
//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center gap-2">
//             <div className={`w-6 h-6 flex items-center justify-center rounded-full ${isActive ? "bg-[#B8E62D]/20" : "bg-white/10"}`}>
//               {GameTypeIcons[type as keyof typeof GameTypeIcons]}
//             </div>
//             <h4 className="text-white font-medium">{type}</h4>
//           </div>
//           <div className={`px-2 py-0.5 rounded text-sm transition-colors ${isActive ? "bg-[#B8E62D]/20" : "bg-white/10"}`}>
//             <span className="text-white font-bold">{stats.last.rating}</span>
//           </div>
//         </div>
        
//         {isActive && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             transition={{ duration: 0.3 }}
//             className="overflow-hidden"
//           >
//             <div className="pt-2">
//               <div className="flex justify-between items-center mb-2">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-white/50 rounded-full"></div>
//                   <span className="text-xs text-white/70">Best: {stats.best.rating}</span>
//                 </div>
//                 <span className="text-xs text-white/70">{totalGames} games</span>
//               </div>
              
//               <div className="bg-black/30 rounded-lg p-2 mb-3">
//                 <div className="flex justify-between mb-1">
//                   <p className="text-xs text-white/60">Win Rate</p>
//                   <p className="text-xs font-medium text-white">{winRate}%</p>
//                 </div>
//                 <div className="w-full bg-black/30 rounded-full h-1.5">
//                   <motion.div 
//                     className="bg-[#B8E62D] h-1.5 rounded-full" 
//                     initial={{ width: 0 }}
//                     animate={{ width: `${winRate}%` }}
//                     transition={{ duration: 0.7, ease: "easeOut" }}
//                   />
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-3 gap-2">
//                 <div className="flex flex-col items-center justify-center">
//                   <p className="text-xs text-white/60">Wins</p>
//                   <p className="text-base font-bold text-[#B8E62D]">{stats.record.win}</p>
//                 </div>
//                 <div className="flex flex-col items-center justify-center">
//                   <p className="text-xs text-white/60">Losses</p>
//                   <p className="text-base font-bold text-red-400">{stats.record.loss}</p>
//                 </div>
//                 <div className="flex flex-col items-center justify-center">
//                   <p className="text-xs text-white/60">Draws</p>
//                   <p className="text-base font-bold text-yellow-400">{stats.record.draw}</p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </motion.div>
//     </Card3D>
//   );
// };

// const StatPreview = ({ 
//   label, 
//   value, 
//   bgColor = "bg-white/5", 
//   textColor = "text-white", 
//   iconClass,
//   index
// }: { 
//   label: string; 
//   value: string | number; 
//   bgColor?: string; 
//   textColor?: string;
//   iconClass?: string;
//   index: number;
// }) => (
//   <Card3D depth={5}>
//     <motion.div 
//       className={`${bgColor} rounded-lg p-3 backdrop-blur-sm flex items-center gap-3`}
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: index * 0.1 }}
//     >
//       {iconClass && (
//         <div className={`w-8 h-8 flex items-center justify-center ${iconClass} rounded-full`}>
//           {StatIcons[label as keyof typeof StatIcons]}
//         </div>
//       )}
//       <div>
//         <p className="text-xs text-white/60">{label}</p>
//         <p className={`text-lg font-bold ${textColor}`}>{value}</p>
//       </div>
//     </motion.div>
//   </Card3D>
// );

// Utility functions for chess rating colors
// const getRatingColor = (rating: number | string): string => {
//   if (typeof rating === 'string') return 'text-white';
//   if (rating < 1000) return 'text-gray-300';
//   if (rating < 1200) return 'text-green-400';
//   if (rating < 1400) return 'text-blue-400';
//   if (rating < 1600) return 'text-purple-400';
//   if (rating < 1800) return 'text-orange-400';
//   if (rating < 2000) return 'text-amber-400';
//   return 'text-red-400';
// };

// Game type icons
// const GameTypeIcons = {
//   Rapid: (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <circle cx="12" cy="12" r="10"></circle>
//       <polyline points="12 6 12 12 16 14"></polyline>
//     </svg>
//   ),
//   Blitz: (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
//     </svg>
//   ),
//   Bullet: (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <line x1="22" y1="2" x2="11" y2="13"></line>
//       <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
//     </svg>
//   )
// };

// Stat icons map
// const StatIcons = {
//   "Overall Rating": (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
//     </svg>
//   ),
//   "Best Rating": (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//     </svg>
//   ),
//   "Total Games": (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
//       <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
//     </svg>
//   ),
//   "Tactics Rating": (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M12 2v4M5 5l2.5 2.5M19 5l-2.5 2.5M5 19l2.5-2.5M19 19l-2.5-2.5M2 12h4M18 12h4M12 18v4"></path>
//     </svg>
//   )
// };

// Custom hook for parallax motion effects
const useParallaxMotion = (options: {
  transformRange?: [number, number],
  rotateRange?: [number, number],
  stiffness?: number,
  damping?: number
}) => {
  const {
    transformRange = [-10, 10],
    rotateRange = [-2, 2],
    stiffness = 50,
    damping = 20
  } = options;
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform values
  const x = useTransform(mouseX, [-300, 300], transformRange);
  const y = useTransform(mouseY, [-300, 300], transformRange);
  const rotateX = useTransform(mouseY, [-300, 300], rotateRange);
  const rotateY = useTransform(mouseX, [-300, 300], rotateRange.map(v => -v)); // Inverse for natural feel
  
  // Spring physics for smoother motion
  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });
  const springRotateX = useSpring(rotateX, { stiffness, damping });
  const springRotateY = useSpring(rotateY, { stiffness, damping });

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const target = e.currentTarget.getBoundingClientRect();
    const centerX = target.left + target.width / 2;
    const centerY = target.top + target.height / 2;
    
    mouseX.set(clientX - centerX);
    mouseY.set(clientY - centerY);
  };

  return {
    mouseX, 
    mouseY,
    springX,
    springY,
    springRotateX,
    springRotateY,
    handleMouseMove
  };
};

// Donut chart component for stat visualizations
// interface DonutChartProps {
//   percent: number;
//   size?: number;
//   strokeWidth?: number;
//   color?: string;
//   label: string;
//   value: string | number;
//   animate?: boolean;
//   index?: number;
// }

// const DonutChart = ({ 
//   percent, 
//   size = 120, 
//   strokeWidth = 8, 
//   color = "#B8E62D",
//   label, 
//   value,
//   animate = true,
//   index = 0
// }: DonutChartProps) => {
//   const radius = (size - strokeWidth) / 2;
//   const circumference = radius * 2 * Math.PI;
//   const strokeDashoffset = circumference - (percent / 100) * circumference;
  
//   return (
//     <Card3D depth={5}>
//       <motion.div 
//         className="bg-gradient-to-b from-black/40 to-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col items-center overflow-hidden"
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4, delay: index * 0.1 }}
//       >
//         <div className="relative w-full flex justify-center mb-2 overflow-hidden">
//           <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
//             {/* Background circle */}
//             <circle
//               cx={size / 2}
//               cy={size / 2}
//               r={radius}
//               fill="none"
//               stroke="rgba(255,255,255,0.1)"
//               strokeWidth={strokeWidth}
//             />
            
//             {/* Progress circle */}
//             <motion.circle
//               cx={size / 2}
//               cy={size / 2}
//               r={radius}
//               fill="none"
//               stroke={color}
//               strokeWidth={strokeWidth}
//               strokeDasharray={circumference}
//               initial={{ strokeDashoffset: circumference }}
//               animate={{ strokeDashoffset: animate ? strokeDashoffset : circumference }}
//               transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
//               strokeLinecap="round"
//             />
//           </svg>
          
//           {/* Inner content */}
//           <div className="max-w-full absolute inset-0 flex flex-col items-center justify-center">
//             <motion.p 
//               className={`text-3xl font-bold ${getRatingColor(value)}`}
//               initial={{ scale: 0.5, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
//             >
//               {value}
//             </motion.p>
//           </div>
//         </div>
        
//         <motion.p 
//           className="text-sm text-white/80 text-center mt-2"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
//         >
//           {label}
//         </motion.p>
//       </motion.div>
//     </Card3D>
//   );
// };

export default function ChessProfile() {
  const [stats, setStats] = useState<ChessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGameType, setActiveGameType] = useState<string>("Bullet");
  const isMobile = useIsMobile();
  // Define available game modes
  const gameModes = ["Rapid", "Blitz", "Bullet"] as const;

  // Use our custom hook for mouse tracking and parallax effects
  const heroParallax = useParallaxMotion({
    transformRange: [10, -10],
    rotateRange: [2, -2],
    stiffness: 50,
    damping: 20
  });
  
  // Eye tracking for the chess knight
  const leftEyeX = useTransform(heroParallax.mouseX, [-200, 200], [-3, 3]);
  const leftEyeY = useTransform(heroParallax.mouseY, [-200, 200], [-3, 3]);
  const rightEyeX = useTransform(heroParallax.mouseX, [-200, 200], [-3, 3]);
  const rightEyeY = useTransform(heroParallax.mouseY, [-200, 200], [-3, 3]);
  
 
  useEffect(() => {
    const fetchChessData = async () => {
      try {
        setLoading(true);
        
        // Using chess.com public API
        const playerDataResponse = await fetch('https://api.chess.com/pub/player/nk010');
        const statsResponse = await fetch('https://api.chess.com/pub/player/nk010/stats');
        
        if (!playerDataResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch chess.com data');
        }
        
        const playerData = await playerDataResponse.json();
        const statsData = await statsResponse.json();
        
        // Process and combine data
        const processedStats: ChessStats = {
          username: playerData.username,
          avatar: playerData.avatar,
          rapid: statsData.chess_rapid,
          blitz: statsData.chess_blitz,
          bullet: statsData.chess_bullet,
          tactics: statsData.tactics,
        };
        
        setStats(processedStats);
        
        // Keep Bullet as the default active game type
        setActiveGameType("Bullet");
        
      } catch (err) {
        console.error('Error fetching chess data:', err);
        setError('Could not load Chess.com profile');
      } finally {
        setLoading(false);
      }
    };

    fetchChessData();
  }, []);

  // useEffect(() => {
  //   if (!loading && stats) {
  //     // Animate win rate graphs after a short delay
  //     const timer = setTimeout(() => {
  //       setShowWinRateGraph(true);
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [loading, stats]);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5 min-h-[420px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-[#B8E62D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white/80">Loading chess profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5 min-h-[420px] flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate overall stats

  // const totalGames = 
  //   (stats.rapid?.record.win || 0) + (stats.rapid?.record.loss || 0) + (stats.rapid?.record.draw || 0) +
  //   (stats.blitz?.record.win || 0) + (stats.blitz?.record.loss || 0) + (stats.blitz?.record.draw || 0) +
  //   (stats.bullet?.record.win || 0) + (stats.bullet?.record.loss || 0) + (stats.bullet?.record.draw || 0);

  // const tacticRating = stats.tactics?.highest?.rating || 'N/A';

  // Create pie chart data for win/loss/draw distribution
  // const getWinLossDrawData = () => {
  //   const activeStats = 
  //   activeGameType === "Bullet" ? stats.bullet :
  //   activeGameType === "Rapid" ? stats.rapid :
  //   activeGameType === "Blitz" ? stats.blitz :
  //   stats.bullet;
    
  //   if (!activeStats) return null;
    
  //   const wins = activeStats.record.win;
  //   const losses = activeStats.record.loss;
  //   const draws = activeStats.record.draw;
  //   const total = wins + losses + draws;
    
  //   const winPercent = Math.round((wins / total) * 100);
  //   const lossPercent = Math.round((losses / total) * 100);
  //   const drawPercent = 100 - winPercent - lossPercent;
    
  //   return { wins, losses, draws, winPercent, lossPercent, drawPercent };
  // };

  // const winLossDrawData = getWinLossDrawData();

  return (
    <motion.div 
      className="flex flex-col bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 sm:p-8 rounded-2xl backdrop-blur-sm border border-white/5"
     
      transition={{ duration: 0.6 }}
      onMouseMove={heroParallax.handleMouseMove}
    > 
      {/* Hero Section with 3D Effects */}
      <motion.div 
        className="relative mb-6 z-10"
        style={{ 
          x: heroParallax.springX, 
          y: heroParallax.springY, 
          rotateX: heroParallax.springRotateX, 
          rotateY: heroParallax.springRotateY,
          transformStyle: "preserve-3d",
          transformPerspective: 1000
        }}
      >
        <div className="flex flex-col items-center gap-4 mb-6 relative">
          <motion.div 
            className="relative w-16 h-16 rounded-full overflow-hidden border border-white/10"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {/* Chess Knight with animated eyes */}
            {isMobile ?
            (<div className="relative w-full h-full">
              <Image src="/images/chess-icon.png" alt="Chess Knight" width={64} height={64} />
            </div>
            ): (
            <div className="w-full h-full bg-[#B58863] flex items-center justify-center">
              <div className="relative w-10 h-10">
                {/* Knight base shape */}
                <svg viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                  <path d="M22 10C32.5 11 38.5 18 38 39L31 39C31 29.5 25.5 26.5 22 22.5L22 10Z" fill="#202020" stroke="#202020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M24 18C24.38 20.91 18.45 25.37 16 27C13 29 13.18 31.34 11 31C9.958 30.06 12.41 27.96 11 28C10 28 11.19 29.23 10 30C9 30 5.997 31 6 26C6 24 12 14 12 14C12 14 13.89 12.1 14 10.5C13.27 9.506 13.5 8.5 13.5 7.5C14.5 6.5 16.5 10 16.5 10L18.5 10C18.5 10 19.28 8.008 21 7C22 7 22 10 22 10" fill="#202020" stroke="#202020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.5 25.5C9.5 25.5 10.5 24.5 10.5 23C10.5 21.5 9.5 19.5 9.5 19.5C8.5 19.5 7.5 18.5 7.5 18.5C6.5 18.5 6.5 19.5 6.5 19.5L7.5 24.5L9.5 25.5Z" fill="#202020" stroke="#202020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                {/* Left eye */}
                <div className="absolute top-[28%] left-[30%] w-[16%] h-[16%] bg-white rounded-full flex items-center justify-center">
                  <motion.div 
                    className="w-[50%] h-[50%] bg-black rounded-full"
                    style={{
                      x: leftEyeX,
                      y: leftEyeY
                    }}
                  />
                </div>
                
                {/* Right eye */}
                <div className="absolute top-[22%] left-[45%] w-[14%] h-[14%] bg-white rounded-full flex items-center justify-center">
                  <motion.div 
                    className="w-[50%] h-[50%] bg-black rounded-full"
                    style={{
                      x: rightEyeX,
                      y: rightEyeY
                    }}
                  />
                </div>
              </div>
            </div>
            ) }
          </motion.div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">Chess</h3>
            <a 
              href={`https://www.chess.com/member/${stats.username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-white/60 hover:text-[#B8E62D] transition-colors flex items-center justify-center gap-1 mt-1"
            >
              <span>View on Chess.com</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
      
      <h4 className="text-lg font-medium text-white mb-4 border-b border-white/10 pb-2 z-10 relative">Game Mode Performance</h4>
      
      {/* Single Comprehensive Game Mode Card */}
      <div className="mb-8 relative z-10">
        <motion.div 
          className="bg-gradient-to-b from-black/60 to-black/30 p-6 rounded-xl backdrop-blur-sm border border-white/5 hover:border-[#B8E62D]/20 transition-all duration-500"
          whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(184, 230, 45, 0.1)" }}
        >
          {/* Game Mode Selector */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-black/30 rounded-lg p-1 gap-1">
              {gameModes.map((mode) => {
                const modeStats = stats[mode.toLowerCase() as keyof typeof stats] as GameTypeStats | undefined;
                if (!modeStats) return null;
                
                return (
                  <motion.button
                    key={mode}
                    onClick={() => setActiveGameType(mode)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      activeGameType === mode 
                        ? 'bg-[#B8E62D] text-black shadow-lg' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {mode}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Active Game Mode Content */}
          {(() => {
            const modeStats = stats[activeGameType.toLowerCase() as keyof typeof stats] as GameTypeStats | undefined;
            if (!modeStats) return null;
            
            const totalModeGames = modeStats.record.win + modeStats.record.loss + modeStats.record.draw;
            const winRate = totalModeGames > 0 ? Math.round((modeStats.record.win / totalModeGames) * 100) : 0;
            const lossRate = totalModeGames > 0 ? Math.round((modeStats.record.loss / totalModeGames) * 100) : 0;
            const drawRate = 100 - winRate - lossRate;
            
            // Choose color based on game mode
            const modeColor = 
              activeGameType === "Rapid" ? "#B8E62D" : 
              activeGameType === "Blitz" ? "#4287f5" : 
              "#f59e0b";
              
            return (
              <motion.div
                key={activeGameType}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Current Rating and Peak */}
                <div className="text-center mb-6">
                  <h4 className="text-white font-medium text-xl mb-2">{activeGameType}</h4>
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-white/60 mb-1">Current Rating</p>
                      <p className="text-xl font-bold text-white">{modeStats.last.rating}</p>
                    </div>
                    <div className="w-px h-10 bg-white/20"></div>
                    <div className="text-center">
                      <p className="text-xs text-white/60 mb-1">Peak Rating</p>
                      <div className="inline-block px-2 py-1 rounded-lg" style={{ backgroundColor: `${modeColor}20` }}>
                        <span className="text-lg font-bold text-white">
                          {modeStats.best.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Win Rate Visualization */}
                <div className="text-center mb-6">
                  {/* Win Rate Bar */}
                  <div className="max-w-xs mx-auto">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium text-white/80">Win Rate</p>
                      <p className="text-sm font-bold text-white">{winRate}%</p>
                    </div>
                    <div className="bg-black/50 rounded-full h-2 w-full overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ backgroundColor: modeColor }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${winRate}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Performance Breakdown */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
                  {/* Large donut chart */}
                  <div className="w-full lg:w-1/2 flex justify-center">
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        
                        {/* Win segment */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#B8E62D"
                          strokeWidth="10"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - winRate / 100)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        
                        {/* Loss segment */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="10"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - lossRate / 100)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          style={{ 
                            transformOrigin: 'center',
                            transform: `rotate(${winRate * 3.6}deg)`
                          }}
                        />
                        
                        {/* Draw segment */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#FBBF24"
                          strokeWidth="10"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - drawRate / 100)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          style={{ 
                            transformOrigin: 'center',
                            transform: `rotate(${(winRate + lossRate) * 3.6}deg)`
                          }}
                        />
                      </svg>
                      
                      {/* Inner circle with total games */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-soft-black/40 m-10">
                        <motion.p 
                          className="text-lg sm:text-xl font-bold text-white" 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.6 }}
                        >
                          {totalModeGames}
                        </motion.p>
                        <motion.p 
                          className="text-xs text-white/60 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.7 }}
                        >
                          Total Games
                        </motion.p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats breakdown */}
                  <div className="w-full lg:w-1/2 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-[#B8E62D] flex-shrink-0"></div>
                        <span className="text-white font-medium text-sm">Wins</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#B8E62D] font-bold text-lg">{modeStats.record.win}</span>
                        <span className="text-white/60 text-xs">({winRate}%)</span>
                      </div>
                      <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#B8E62D] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${winRate}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-[#EF4444] flex-shrink-0"></div>
                        <span className="text-white font-medium text-sm">Losses</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-400 font-bold text-lg">{modeStats.record.loss}</span>
                        <span className="text-white/60 text-xs">({lossRate}%)</span>
                      </div>
                      <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#EF4444] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${lossRate}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-[#FBBF24] flex-shrink-0"></div>
                        <span className="text-white font-medium text-sm">Draws</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-400 font-bold text-lg">{modeStats.record.draw}</span>
                        <span className="text-white/60 text-xs">({drawRate}%)</span>
                      </div>
                      <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#FBBF24] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${drawRate}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </motion.div>
      </div>
    </motion.div>
  );
} 