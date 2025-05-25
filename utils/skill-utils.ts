import React from 'react';

export type SizeType = 'xs' | 'sm' | 'md' | 'lg';

export type PositionProps = {
  x: string;
  y: string;
  size: SizeType;
  delay: number;
  duration: number;
  translateX: number;
  translateY: number;
};

/**
 * Generates positions for skill icons using preset coordinates
 * in a style similar to the Mobbin layout
 */
export function generateMobbinPositions(count = 12): PositionProps[] {
  const positions: PositionProps[] = [];
  const delayRange = { min: 0, max: 2 }; // Shorter delays for more synchronized motion
  const durationRange = { min: 5, max: 8 }; // Shorter durations for Mobbin-like fluidity
  
  // Positions inspired by Mobbin layout
  const presetPositions = [
    { x: 53.19, y: 0 },     // Top center
    { x: 93.22, y: 7.14 },  // Top right
    { x: 75.42, y: 88.57 }, // Bottom right
    { x: 16.94, y: 14.29 }, // Top left
    { x: 0.56, y: 1.71 },  // Far left top
    { x: 73.33, y: 20 },    // Right upper
    { x: 0.56, y: 42.29 }, // Far left middle
    { x: 92.36, y: 45.71 }, // Right middle
    { x: 3.39, y: 78.43 },  // Bottom left
    { x: 40.83, y: 75.71 }, // Bottom center
    { x: 93.1, y: 69.43 },  // Far right bottom
    { x: 28, y: 55 },       // Middle center
  ];

  for (let i = 0; i < count; i++) {
    // Use preset position and add small float movement
    const preset = presetPositions[i % presetPositions.length];
    
    // Generate random translation values for floating movement
    const translateX = (Math.random() * 60) - 30; // -30px to +30px
    const translateY = (Math.random() * 60) - 30; // -30px to +30px
    
    const delay = Math.random() * (delayRange.max - delayRange.min) + delayRange.min;
    const duration = Math.random() * (durationRange.max - durationRange.min) + durationRange.min;

    positions.push({
      x: `${preset.x}%`,
      y: `${preset.y}%`,
      size: 'md' as SizeType,
      delay,
      duration,
      translateX,
      translateY
    });
  }

  return positions;
}

/**
 * Get custom glow colors for skill icons
 */
export function getSkillGlowColors(skill: string): { from: string; to: string } {
  const colorMap: Record<string, { from: string; to: string }> = {
    // Frontend
    React: { from: '#38bdf8', to: '#3b82f6' },
    Nextjs: { from: '#94a3b8', to: '#334155' },
    Vue: { from: '#34d399', to: '#059669' },
    JavaScript: { from: '#fcd34d', to: '#f59e0b' },
    Typescript: { from: '#60a5fa', to: '#4f46e5' },
    HTML5: { from: '#fb923c', to: '#ea580c' },
    CSS: { from: '#456EEF', to: '#2563eb' },

    // Backend
    NodeJs: { from: '#4ade80', to: '#16a34a' },
    Django: { from: '#FFFFFF', to: '#E5E5E5' },
    Python: { from: '#60a5fa', to: '#facc15' },
    Java: { from: '#fb923c', to: '#ef4444' },
    'C++': { from: '#60a5fa', to: '#4f46e5' },
    C_Sharp: { from: '#68bc71', to: '#37A041' },
    CSharp: { from: '#68bc71', to: '#37A041' }, // Added alias for C#

    // Databases
    MySQL: { from: '#60a5fa', to: '#0284c7' },
    Postgresql: { from: '#60a5fa', to: '#4338ca' },
    Firebase: { from: '#EEBE32', to: '#F5A623' },

    // DevOps & Tools
    Docker: { from: '#18B9C5', to: '#0891b2' },
    Kubernetes: { from: '#60a5fa', to: '#4f46e5' },
    Git: { from: '#fb923c', to: '#dc2626' },
    Jenkins: { from: '#f87171', to: '#b91c1c' },
    VS_Code: { from: '#60a5fa', to: '#4f46e5' },
    AWS: { from: '#fb923c', to: '#c2410c' },
    GitHub: { from: '#E5E5E5', to: '#CCCCCC' },
    GitLab: { from: '#FC6D26', to: '#E24329' },
    Microsoft_Azure: { from: '#60a5fa', to: '#4f46e5' },
    Linux: { from: '#facc15', to: '#ea580c' },
    Wordpress: { from: '#60a5fa', to: '#4338ca' },
    WordPress: { from: '#60a5fa', to: '#4338ca' },
    Shopify: { from: '#5B8A3C', to: '#479537' },
  };

  return colorMap[skill] || { from: '#3B82F6', to: '#3B82F6' };
}

/**
 * Decide if an icon needs a white background
 */
export function needsBackground(skill: string): boolean {
  const nonLinearShapes = [
    'React', 'NodeJs', 'Vue', 'Python', 'Docker',
    'Kubernetes', 'Git-logo', 'AWS', 'Firebase',
    'Jenkins', 'Linux', 'HTML5', 'Nextjs', 'Django',
    'JavaScript', 'Typescript'
  ];
  return nonLinearShapes.includes(skill);
}

/**
 * Check if we should use PNG version of a skill icon
 */
export function isPngIcon(skill: string): boolean {
  // List of skills that only have PNG files
  const pngIcons = [
    'JavaScript',
    'Docker',
    'GitHub',
    'Azure',
    'WordPress',
    'Shopify',
    'aws',
    'GitLab',
    'Nextjs',
    'Django',
    'Firebase'
  ];
  return pngIcons.includes(skill);
}

/**
 * Function to determine if a skill should be excluded
 */
export function shouldExcludeSkill(skill: string): boolean {
  const excludedSkills = [
    'HTML5', 'CSS', 'C++', 'Azure', 'C_Sharp', 'CSharp', 
    'WordPress', 'Wordpress', 'Microsoft_Azure', 'C#'
  ];
  return excludedSkills.includes(skill);
}

/**
 * Get SVG tile effect styles for an icon
 */
export function getSvgTileEffectStyles(skill: string): React.CSSProperties {
  const glowColors = getSkillGlowColors(skill);
  
  return {
    background: `#18181B`,
    boxShadow: `0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 1px ${glowColors.from}20`,
    border: `1px solid ${glowColors.from}15`,
    borderRadius: '14px',
    padding: '10px',
    backdropFilter: 'blur(5px)'
  };
}

/**
 * Get PNG specific background styles
 */
export function getPngBackgroundStyles(skill: string): React.CSSProperties {
  const glowColors = getSkillGlowColors(skill);
  
  return {
    background: `#18181B`,
    boxShadow: `0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 1px ${glowColors.from}15`,
    border: `1px solid ${glowColors.from}10`,
    borderRadius: '14px',
    padding: '8px',
  };
} 