/**
 * 3D Utilities for Skills Section
 * Handles sphere positioning and skill importance calculations
 */

export interface SphereCoordinates {
  x: number;
  y: number;
  z: number;
}

export interface SkillStyle {
  fontSize: string;
  fontWeight: number;
}

/**
 * Calculate 3D coordinates for positioning items on a sphere
 */
export const getSphereCoordinates = (
  index: number, 
  total: number, 
  radius: number = 200
): SphereCoordinates => {
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  
  return {
    x: radius * Math.cos(theta) * Math.sin(phi),
    y: radius * Math.sin(theta) * Math.sin(phi),
    z: radius * Math.cos(phi),
  };
};

/**
 * Calculate opacity based on z-position for depth effect
 */
export const getDepthOpacity = (z: number, radius: number): number => {
  const zScaled = (z + radius) / (2 * radius); // Scale to 0-1
  return Math.max(0.4, zScaled);
};

/**
 * Get font styling based on skill importance
 */
export const getSkillStyle = (skill: string): SkillStyle => {
  // Major skills - most prominent
  const majorSkills = ['Java', 'Python', 'React', 'NodeJs'];
  
  // Medium-important skills
  const mediumSkills = ['JavaScript', 'TypeScript', 'Docker', 'Firebase'];
  
  if (majorSkills.includes(skill)) {
    return { fontSize: '2.2rem', fontWeight: 700 };
  } else if (mediumSkills.includes(skill)) {
    return { fontSize: '1.5rem', fontWeight: 600 };
  } else {
    return { fontSize: '1rem', fontWeight: 400 };
  }
};

/**
 * Generate stable IDs for skills to prevent re-renders
 */
export const generateSkillIds = (skills: string[]): string[] => {
  return skills.map((skill, index) => 
    `${skill}-${index}-${Math.random().toString(36).slice(2, 8)}`
  );
}; 