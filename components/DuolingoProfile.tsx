'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, MotionValue } from 'framer-motion';

interface DuolingoStats {
  username: string;
  name?: string;
  streak: number;
  totalXp: number;
  profilePicture?: string;
  languages: Array<{
    language: string;
    level: number;
    xp: number;
    progress?: number;
  }>;
}

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
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
        className="w-full h-full"
      >
        {children}
        
        {/* Glare effect */}
        {glare && (
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

// Language bar with 3D effects and fluid animations
const LanguageBar = ({ 
  language, 
  level, 
  xp, 
  progress = 0, 
  color, 
  index 
}: { 
  language: string; 
  level: number; 
  xp: number; 
  progress?: number; 
  color: string; 
  index: number;
}) => {
  return (
    <Card3D depth={5} glare={true}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.1 * index,
          ease: [0.23, 1, 0.32, 1]
        }}
        className="bg-white/5 rounded-lg p-4 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
            />
            <p className="text-white font-medium">{language}</p>
          </div>
          <div className="text-white/70 text-sm flex items-center gap-1">
            <motion.div
              className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-full"
              whileHover={{ scale: 1.2, backgroundColor: `${color}30` }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={color} />
              </svg>
            </motion.div>
            <span>Level {level}</span>
          </div>
        </div>
        
        <div className="w-full bg-black/30 rounded-full h-2.5 mb-1 overflow-hidden">
          <motion.div 
            className="h-2.5 rounded-full relative" 
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut", 
              delay: 0.2 + index * 0.1 
            }}
          >
            {/* Animated shine effect */}
            <motion.div 
              className="absolute inset-0 h-full w-20"
              style={{ 
                background: `linear-gradient(90deg, ${color}00 0%, ${color}60 50%, ${color}00 100%)`
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut", 
                repeatDelay: 1 + index * 0.5
              }}
            />
          </motion.div>
        </div>
        
        <div className="text-right text-xs text-white/60 flex justify-between items-center">
          <motion.div 
            className="bg-white/10 px-2 py-0.5 rounded-full text-white/70 text-xs"
            whileHover={{ backgroundColor: `${color}20`, color: color }}
          >
            {Math.round(progress)}% complete
          </motion.div>
          <span>{xp.toLocaleString()} XP</span>
        </div>
      </motion.div>
    </Card3D>
  );
};

// Animated stat card component
const StatCard = ({ 
  icon, 
  label, 
  value, 
  color, 
  delay = 0 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: string; 
  delay?: number;
}) => {
  return (
    <Card3D depth={7} glare={true}>
      <motion.div 
        className="bg-white/5 rounded-lg p-4 backdrop-blur-sm flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay, 
          ease: [0.23, 1, 0.32, 1]
        }}
      >
        <div className={`w-10 h-10 flex items-center justify-center rounded-full`} style={{ backgroundColor: `${color}20` }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {icon}
          </motion.div>
        </div>
        <div>
          <p className="text-sm text-white/60">{label}</p>
          <motion.p 
            className="text-2xl font-bold"
            style={{ color }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
        </div>
      </motion.div>
    </Card3D>
  );
};

export default function DuolingoProfile() {
  const [stats, setStats] = useState<DuolingoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mouse motion for parallax effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform mouse position into parallax values
  const owlX = useTransform(mouseX, [-300, 300], [15, -15]);
  const owlY = useTransform(mouseY, [-300, 300], [15, -15]);
  
  // Add springs for smoother motion
  const springOwlX = useSpring(owlX, { stiffness: 100, damping: 30 });
  const springOwlY = useSpring(owlY, { stiffness: 100, damping: 30 });
  
  // Background elements
  const bgX = useTransform(mouseX, [-300, 300], [5, -5]);
  const bgY = useTransform(mouseY, [-300, 300], [5, -5]);
  const springBgX = useSpring(bgX, { stiffness: 50, damping: 30 });
  const springBgY = useSpring(bgY, { stiffness: 50, damping: 30 });
  
  // Additional transforms needed for other elements
  const leftBgX = useTransform(mouseX, [-300, 300], [-5, 5]);
  const leftBgY = useTransform(mouseY, [-300, 300], [-5, 5]);
  
  // Eye tracking transforms
  const leftEyeX = useTransform(mouseX, [-200, 200], [-3, 3]);
  const leftEyeY = useTransform(mouseY, [-200, 200], [-3, 3]);
  const rightEyeX = useTransform(mouseX, [-200, 200], [-3, 3]);
  const rightEyeY = useTransform(mouseY, [-200, 200], [-3, 3]);

  // Track mouse position
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  useEffect(() => {
    const fetchDuolingoData = async () => {
      try {
        setLoading(true);
        
        // Use our server-side API endpoint to fetch real Duolingo data
        const response = await fetch('/api/duolingo?username=nizarkadri');
        
        if (!response.ok) {
          throw new Error('Failed to fetch Duolingo data');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching Duolingo data:', err);
        setError('Could not load Duolingo profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDuolingoData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5 min-h-[420px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div 
            className="w-16 h-16 mb-4 flex items-center justify-center"
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <svg width="64" height="64" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 105C84.8528 105 105 84.8528 105 60C105 35.1472 84.8528 15 60 15C35.1472 15 15 35.1472 15 60C15 84.8528 35.1472 105 60 105Z" fill="#58CC02"/>
              <path d="M60 90C76.5685 90 90 76.5685 90 60C90 43.4315 76.5685 30 60 30C43.4315 30 30 43.4315 30 60C30 76.5685 43.4315 90 60 90Z" fill="#89E219"/>
              <path d="M50 50C53.866 50 57 46.866 57 43C57 39.134 53.866 36 50 36C46.134 36 43 39.134 43 43C43 46.866 46.134 50 50 50Z" fill="white"/>
              <path d="M70 50C73.866 50 77 46.866 77 43C77 39.134 73.866 36 70 36C66.134 36 63 39.134 63 43C63 46.866 66.134 50 70 50Z" fill="white"/>
              <path d="M52 45C54.2091 45 56 43.2091 56 41C56 38.7909 54.2091 37 52 37C49.7909 37 48 38.7909 48 41C48 43.2091 49.7909 45 52 45Z" fill="#4B4B4B"/>
              <path d="M68 45C70.2091 45 72 43.2091 72 41C72 38.7909 70.2091 37 68 37C65.7909 37 64 38.7909 64 41C64 43.2091 65.7909 45 68 45Z" fill="#4B4B4B"/>
              <path d="M60 75C68.2843 75 75 68.2843 75 60C75 51.7157 68.2843 45 60 45C51.7157 45 45 51.7157 45 60C45 68.2843 51.7157 75 60 75Z" fill="#FFC200"/>
              <path d="M60 70C65.5228 70 70 65.5228 70 60C70 54.4772 65.5228 50 60 50C54.4772 50 50 54.4772 50 60C50 65.5228 54.4772 70 60 70Z" fill="#FFE34D"/>
              <path d="M55 58C56.6569 58 58 56.6569 58 55C58 53.3431 56.6569 52 55 52C53.3431 52 52 53.3431 52 55C52 56.6569 53.3431 58 55 58Z" fill="white"/>
              <path d="M65 58C66.6569 58 68 56.6569 68 55C68 53.3431 66.6569 52 65 52C63.3431 52 62 53.3431 62 55C62 56.6569 63.3431 58 65 58Z" fill="white"/>
              <path d="M60 65C62.7614 65 65 62.7614 65 60C65 57.2386 62.7614 55 60 55C57.2386 55 55 57.2386 55 60C55 62.7614 57.2386 65 60 65Z" fill="#FF9600"/>
            </svg>
          </motion.div>
          <motion.div 
            className="text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Duolingo profile...
          </motion.div>
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

  // Language color mapping
  const languageColors: Record<string, string> = {
    Spanish: '#ff4b4b',
    French: '#1cb0f6',
    German: '#ffc800',
    Italian: '#ff9600',
    Portuguese: '#7b7b7b',
    Japanese: '#ff9600',
    Korean: '#ce82ff',
    Chinese: '#ff4b4b',
    English: '#8ee000',
    Default: '#1cb0f6',
  };

  // Sort languages by XP (highest first)
  const sortedLanguages = [...stats.languages].sort((a, b) => b.xp - a.xp);

  return (
    <motion.div 
      className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5 overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onMouseMove={handleMouseMove}
    >
      {/* Background decoration */}
      <motion.div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#58cc02]/5 filter blur-3xl"
        style={{ 
          x: springBgX, 
          y: springBgY,
          rotate: 10
        }}
      />
      
      <motion.div 
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#ff9600]/5 filter blur-3xl"
        style={{ 
          x: leftBgX, 
          y: leftBgY,
          rotate: -10
        }}
      />
      
      {/* Profile header with 3D effect */}
      <div className="relative z-10 mb-8">
        <div className="flex flex-col items-center justify-center mb-6 gap-4">
          <motion.div 
            className="relative w-20 h-20 rounded-full overflow-hidden shadow-xl"
            style={{ 
              x: springOwlX, 
              y: springOwlY,
            }}
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ rotate: { duration: 0.5 } }}
          >
            {/* Duolingo Owl with eyes that follow cursor */}
            <div className="w-full h-full relative bg-[#58CC02] flex items-center justify-center">
              {/* Owl body */}
              <div className="w-full h-full bg-[#58CC02] rounded-full relative">
                {/* Owl belly */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#89E219] rounded-full"></div>
                
                {/* Left eye socket */}
                <div className="absolute top-[35%] left-[30%] w-[25%] h-[25%] bg-white rounded-full flex items-center justify-center">
                  {/* Left pupil - follows cursor */}
                  <motion.div 
                    className="w-[45%] h-[45%] bg-[#4B4B4B] rounded-full"
                    style={{
                      x: leftEyeX,
                      y: leftEyeY
                    }}
                  />
                </div>
                
                {/* Right eye socket */}
                <div className="absolute top-[35%] right-[30%] w-[25%] h-[25%] bg-white rounded-full flex items-center justify-center">
                  {/* Right pupil - follows cursor */}
                  <motion.div 
                    className="w-[45%] h-[45%] bg-[#4B4B4B] rounded-full"
                    style={{
                      x: rightEyeX,
                      y: rightEyeY
                    }}
                  />
                </div>
                
                {/* Beak */}
                <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 w-[40%] h-[15%] bg-[#FFC200] rounded-full">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#FFE34D] rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="text-center">
            <motion.h3 
              className="text-xl font-bold text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Duolingo
            </motion.h3>
            <motion.a 
              href={`https://www.duolingo.com/profile/${stats.username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-white/60 hover:text-[#58cc02] transition-colors flex items-center justify-center gap-1 mt-1"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -2 }}
            >
              <span>View on Duolingo</span>
              <motion.svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </motion.svg>
            </motion.a>
          </div>
        </div>
      </div>

      {/* Stat cards with 3D effects */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard 
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3L21 7L17 11V8H10V6H17V3Z" fill="#ff9600" />
              <path d="M7 21L3 17L7 13V16H14V18H7V21Z" fill="#ff9600" />
            </svg>
          }
          label="Current Streak"
          value={`${stats.streak} days`}
          color="#ff9600"
          delay={0.1}
        />
        
        <StatCard 
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#58cc02" />
            </svg>
          }
          label="Total XP"
          value={stats.totalXp.toLocaleString()}
          color="#58cc02"
          delay={0.2}
        />
      </div>

      {/* Languages section with animated title */}
      <div className="mb-3">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            className="w-6 h-6 rounded-full bg-[#58cc02]/10 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12m-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="#58cc02"/>
            </svg>
          </motion.div>
          <h4 className="text-md font-medium text-white">Languages</h4>
        </motion.div>
      </div>
      
      {/* Language bars with 3D effects */}
      <div className="space-y-3 relative z-10">
        {sortedLanguages.map((lang, index) => (
          <LanguageBar
            key={lang.language}
            language={lang.language}
            level={lang.level}
            xp={lang.xp}
            progress={lang.progress || 0}
            color={languageColors[lang.language] || languageColors.Default}
            index={index}
          />
        ))}
      </div>
      
      {/* Achievement animations */}
      {stats.streak >= 30 && (
        <motion.div 
          className="absolute bottom-6 right-6 w-16 h-16 flex items-center justify-center"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [-30, 10, 0]
          }}
          transition={{ 
            delay: 1, 
            duration: 0.6,
            ease: "backOut"
          }}
        >
          <motion.div 
            className="relative"
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="absolute -inset-1 bg-[#ff9600]/20 rounded-full blur-md" />
            <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-[#ff9600] to-[#ffb700] rounded-full flex items-center justify-center shadow-lg shadow-[#ff9600]/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" fill="white"/>
                <path d="M12 9.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
                <text x="12" y="15" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white">{stats.streak}</text>
              </svg>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
} 