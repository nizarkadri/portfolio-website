'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

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

// 3D Card wrapper component
const Card3D = ({ children, depth = 10, className = "" }: { children: React.ReactNode, depth?: number, className?: string }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const rotateXValue = ((mouseY - centerY) / (rect.height / 2)) * -depth;
    const rotateYValue = ((mouseX - centerX) / (rect.width / 2)) * depth;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setScale(1.02);
  };

  const handleMouseLeave = () => {
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
        style={{ 
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          transition: "all 0.15s ease-out"
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const GameTypeCard = ({ type, stats, isActive, onClick, index }: { 
  type: string; 
  stats?: GameTypeStats; 
  isActive: boolean;
  onClick: () => void;
  index: number;
}) => {
  if (!stats) return null;
  
  const totalGames = stats.record.win + stats.record.loss + stats.record.draw;
  const winRate = totalGames > 0 ? Math.round((stats.record.win / totalGames) * 100) : 0;
  
  const getGameTypeIcon = () => {
    switch(type) {
      case "Rapid":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case "Blitz":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
        );
      case "Bullet":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card3D depth={7} className="cursor-pointer">
      <motion.div 
        className={`rounded-lg p-4 backdrop-blur-sm transition-all ${
          isActive 
            ? "bg-white/15 border border-white/20 shadow-lg shadow-white/5" 
            : "bg-white/5 hover:bg-white/10"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 flex items-center justify-center rounded-full ${isActive ? "bg-[#B8E62D]/20" : "bg-white/10"}`}>
              {getGameTypeIcon()}
            </div>
            <h4 className="text-white font-medium">{type}</h4>
          </div>
          <div className={`px-2 py-0.5 rounded text-sm transition-colors ${isActive ? "bg-[#B8E62D]/20" : "bg-white/10"}`}>
            <span className="text-white font-bold">{stats.last.rating}</span>
          </div>
        </div>
        
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <span className="text-xs text-white/70">Best: {stats.best.rating}</span>
                </div>
                <span className="text-xs text-white/70">{totalGames} games</span>
              </div>
              
              <div className="bg-black/30 rounded-lg p-2 mb-3">
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-white/60">Win Rate</p>
                  <p className="text-xs font-medium text-white">{winRate}%</p>
                </div>
                <div className="w-full bg-black/30 rounded-full h-1.5">
                  <motion.div 
                    className="bg-[#B8E62D] h-1.5 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${winRate}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs text-white/60">Wins</p>
                  <p className="text-base font-bold text-[#B8E62D]">{stats.record.win}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs text-white/60">Losses</p>
                  <p className="text-base font-bold text-red-400">{stats.record.loss}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs text-white/60">Draws</p>
                  <p className="text-base font-bold text-yellow-400">{stats.record.draw}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Card3D>
  );
};

const StatPreview = ({ 
  label, 
  value, 
  bgColor = "bg-white/5", 
  textColor = "text-white", 
  iconClass,
  index
}: { 
  label: string; 
  value: string | number; 
  bgColor?: string; 
  textColor?: string;
  iconClass?: string;
  index: number;
}) => (
  <Card3D depth={5}>
    <motion.div 
      className={`${bgColor} rounded-lg p-3 backdrop-blur-sm flex items-center gap-3`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {iconClass && (
        <div className={`w-8 h-8 flex items-center justify-center ${iconClass} rounded-full`}>
          {label === "Overall Rating" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          )}
          {label === "Best Rating" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          )}
          {label === "Total Games" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          )}
          {label === "Tactics Rating" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M5 5l2.5 2.5M19 5l-2.5 2.5M5 19l2.5-2.5M19 19l-2.5-2.5M2 12h4M18 12h4M12 18v4"></path>
            </svg>
          )}
        </div>
      )}
      <div>
        <p className="text-xs text-white/60">{label}</p>
        <p className={`text-lg font-bold ${textColor}`}>{value}</p>
      </div>
    </motion.div>
  </Card3D>
);

export default function ChessProfile() {
  const [stats, setStats] = useState<ChessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGameType, setActiveGameType] = useState<string>("Rapid");
  const [showWinRateGraph, setShowWinRateGraph] = useState(false);

  // Add mouse position tracking for hero section
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Hero section parallax
  const heroX = useTransform(mouseX, [-300, 300], [10, -10]);
  const heroY = useTransform(mouseY, [-300, 300], [10, -10]);
  const heroRotateX = useTransform(mouseY, [-300, 300], [2, -2]);
  const heroRotateY = useTransform(mouseX, [-300, 300], [-2, 2]);
  
  // Spring physics for smoother motion
  const springHeroX = useSpring(heroX, { stiffness: 50, damping: 20 });
  const springHeroY = useSpring(heroY, { stiffness: 50, damping: 20 });
  const springHeroRotateX = useSpring(heroRotateX, { stiffness: 50, damping: 20 });
  const springHeroRotateY = useSpring(heroRotateY, { stiffness: 50, damping: 20 });

  // Eye tracking transforms for chess knight
  const leftEyeX = useTransform(mouseX, [-200, 200], [-3, 3]);
  const leftEyeY = useTransform(mouseY, [-200, 200], [-3, 3]);
  const rightEyeX = useTransform(mouseX, [-200, 200], [-3, 3]);
  const rightEyeY = useTransform(mouseY, [-200, 200], [-3, 3]);
  
  // Chessboard background parallax effect
  const boardX = useTransform(mouseX, [-300, 300], [5, -5]);
  const boardY = useTransform(mouseY, [-300, 300], [5, -5]);
  const springBoardX = useSpring(boardX, { stiffness: 40, damping: 25 });
  const springBoardY = useSpring(boardY, { stiffness: 40, damping: 25 });

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const target = e.currentTarget.getBoundingClientRect();
    const centerX = target.left + target.width / 2;
    const centerY = target.top + target.height / 2;
    
    mouseX.set(clientX - centerX);
    mouseY.set(clientY - centerY);
  };

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
        
        // Set active game type based on availability
        if (processedStats.rapid) {
          setActiveGameType("Rapid");
        } else if (processedStats.blitz) {
          setActiveGameType("Blitz");
        } else if (processedStats.bullet) {
          setActiveGameType("Bullet");
        }
        
      } catch (err) {
        console.error('Error fetching chess data:', err);
        setError('Could not load Chess.com profile');
      } finally {
        setLoading(false);
      }
    };

    fetchChessData();
  }, []);

  useEffect(() => {
    if (!loading && stats) {
      // Animate win rate graphs after a short delay
      const timer = setTimeout(() => {
        setShowWinRateGraph(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, stats]);

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
  const calculateOverallRating = () => {
    const ratings = [];
    if (stats.rapid?.last.rating) ratings.push(stats.rapid.last.rating);
    if (stats.blitz?.last.rating) ratings.push(stats.blitz.last.rating);
    if (stats.bullet?.last.rating) ratings.push(stats.bullet.last.rating);
    
    if (ratings.length === 0) return 'N/A';
    return Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
  };
  
  const getBestRating = () => {
    const ratings = [];
    if (stats.rapid?.best.rating) ratings.push(stats.rapid.best.rating);
    if (stats.blitz?.best.rating) ratings.push(stats.blitz.best.rating);
    if (stats.bullet?.best.rating) ratings.push(stats.bullet.best.rating);
    
    if (ratings.length === 0) return 'N/A';
    return Math.max(...ratings);
  };

  const totalGames = 
    (stats.rapid?.record.win || 0) + (stats.rapid?.record.loss || 0) + (stats.rapid?.record.draw || 0) +
    (stats.blitz?.record.win || 0) + (stats.blitz?.record.loss || 0) + (stats.blitz?.record.draw || 0) +
    (stats.bullet?.record.win || 0) + (stats.bullet?.record.loss || 0) + (stats.bullet?.record.draw || 0);

  const tacticRating = stats.tactics?.highest?.rating || 'N/A';

  // Create pie chart data for win/loss/draw distribution
  const getWinLossDrawData = () => {
    const activeStats = activeGameType === "Rapid" 
      ? stats.rapid 
      : activeGameType === "Blitz" 
        ? stats.blitz 
        : stats.bullet;
    
    if (!activeStats) return null;
    
    const wins = activeStats.record.win;
    const losses = activeStats.record.loss;
    const draws = activeStats.record.draw;
    const total = wins + losses + draws;
    
    const winPercent = Math.round((wins / total) * 100);
    const lossPercent = Math.round((losses / total) * 100);
    const drawPercent = 100 - winPercent - lossPercent;
    
    return { wins, losses, draws, winPercent, lossPercent, drawPercent };
  };

  const winLossDrawData = getWinLossDrawData();
  
  // Dynamic rainbow gradient based on rating
  const getRatingColor = (rating: number | string) => {
    if (typeof rating === 'string') return 'text-white';
    if (rating < 1000) return 'text-gray-300';
    if (rating < 1200) return 'text-green-400';
    if (rating < 1400) return 'text-blue-400';
    if (rating < 1600) return 'text-purple-400';
    if (rating < 1800) return 'text-orange-400';
    if (rating < 2000) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <motion.div 
      className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 sm:p-8 rounded-2xl backdrop-blur-sm border border-white/5 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onMouseMove={handleMouseMove}
    >
      {/* Chess board background */}
      <motion.div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          x: springBoardX,
          y: springBoardY
        }}
      >
        {/* Fade gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-soft-black/20 to-soft-black/90 z-10"></div>
        
        <div className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] grid grid-cols-8 opacity-[0.04]" style={{ transform: "rotate(15deg)" }}>
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isLight = (row + col) % 2 === 0;
            return (
              <div 
                key={i} 
                className={`${isLight ? 'bg-white/20' : 'bg-[#121212]/80'}`}
              />
            );
          })}
        </div>
      </motion.div>
      
      {/* Hero Section with 3D Effects */}
      <motion.div 
        className="relative mb-8"
        style={{ 
          x: springHeroX, 
          y: springHeroY, 
          rotateX: springHeroRotateX, 
          rotateY: springHeroRotateY,
          transformStyle: "preserve-3d",
          transformPerspective: 1000
        }}
      >
        <div className="flex flex-col items-center gap-4 mb-6 relative z-10">
          <motion.div 
            className="relative w-16 h-16 rounded-full overflow-hidden border border-white/10"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {/* Chess Knight with animated eyes */}
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
        
        {/* Background decorative elements */}
        <motion.div 
          className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#b8e62d]/10 to-transparent rounded-full filter blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ zIndex: 0 }}
        />
        
        <motion.div 
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-white/5 to-transparent rounded-full filter blur-xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{ zIndex: 0 }}
        />
      </motion.div>
      
      {/* Stats Grid with 3D Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 relative z-10">
        <StatPreview 
          label="Overall Rating" 
          value={calculateOverallRating()} 
          textColor={getRatingColor(calculateOverallRating())}
          iconClass="bg-white/10"
          index={0}
        />
        <StatPreview 
          label="Best Rating" 
          value={getBestRating()} 
          textColor={getRatingColor(getBestRating())}
          iconClass="bg-yellow-500/10"
          index={1}
        />
        <StatPreview 
          label="Total Games" 
          value={totalGames} 
          iconClass="bg-blue-500/10"
          index={2}
        />
        <StatPreview 
          label="Tactics Rating" 
          value={tacticRating} 
          textColor={getRatingColor(tacticRating)}
          iconClass="bg-purple-500/10"
          index={3}
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-md font-medium text-white">Game Stats</h4>
        <motion.div 
          className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-full"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          Click to expand
        </motion.div>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {stats.rapid && (
            <GameTypeCard 
              key="rapid"
              type="Rapid" 
              stats={stats.rapid} 
              isActive={activeGameType === "Rapid"}
              onClick={() => setActiveGameType("Rapid")}
              index={0}
            />
          )}
          
          {stats.blitz && (
            <GameTypeCard 
              key="blitz"
              type="Blitz" 
              stats={stats.blitz} 
              isActive={activeGameType === "Blitz"}
              onClick={() => setActiveGameType("Blitz")}
              index={1}
            />
          )}
          
          {stats.bullet && (
            <GameTypeCard 
              key="bullet"
              type="Bullet" 
              stats={stats.bullet} 
              isActive={activeGameType === "Bullet"}
              onClick={() => setActiveGameType("Bullet")}
              index={2}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Performance Graph with 3D effect */}
      {winLossDrawData && (
        <Card3D depth={8} className="mt-5">
          <motion.div 
            className="p-4 bg-white/5 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-white">{activeGameType} Performance</h4>
              <div className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                {winLossDrawData.wins + winLossDrawData.losses + winLossDrawData.draws} games
              </div>
            </div>
            
            <div className="flex items-center gap-1 h-3 w-full rounded-full overflow-hidden mb-3 relative">
              {showWinRateGraph && (
                <>
                  <motion.div 
                    className="h-full bg-[#B8E62D]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${winLossDrawData.winPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-[#B8E62D]/0 via-[#B8E62D]/30 to-[#B8E62D]/0"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                      style={{ width: `${winLossDrawData.winPercent}%` }}
                    />
                  </motion.div>
                  <motion.div 
                    className="h-full bg-red-400" 
                    initial={{ width: 0 }}
                    animate={{ width: `${winLossDrawData.lossPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/30 to-red-400/0"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.7 }}
                      style={{ width: `${winLossDrawData.lossPercent}%` }}
                    />
                  </motion.div>
                  <motion.div 
                    className="h-full bg-yellow-400" 
                    initial={{ width: 0 }}
                    animate={{ width: `${winLossDrawData.drawPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/30 to-yellow-400/0"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.9 }}
                      style={{ width: `${winLossDrawData.drawPercent}%` }}
                    />
                  </motion.div>
                </>
              )}
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <motion.div 
                  className="w-2 h-2 bg-[#B8E62D] rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-white/80">Wins: {winLossDrawData.winPercent}%</span>
              </div>
              <div className="flex items-center gap-1">
                <motion.div 
                  className="w-2 h-2 bg-red-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                />
                <span className="text-white/80">Losses: {winLossDrawData.lossPercent}%</span>
              </div>
              <div className="flex items-center gap-1">
                <motion.div 
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                />
                <span className="text-white/80">Draws: {winLossDrawData.drawPercent}%</span>
              </div>
            </div>
          </motion.div>
        </Card3D>
      )}
    </motion.div>
  );
} 