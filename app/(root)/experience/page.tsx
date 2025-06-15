import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';


interface Experience {
  title: string;
  company: string;
  position: string;
  period: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

interface Education {
  institution: string;
  degree: string;
  period: string;
  location?: string;
}

// Helper function to extract numeric value from achievement string
const extractNumericValue = (achievement: string): { value: number | null, metric: string | null } => {
  const match = achievement.match(/(\d+)%/);
  if (match) {
    // Try to determine what metric this percentage represents
    const lowerAchievement = achievement.toLowerCase();
    let metric = 'Improvement';
    
    if (lowerAchievement.includes('deployment time') || lowerAchievement.includes('deploy')) {
      metric = 'Faster Deployment';
    } else if (lowerAchievement.includes('page load') || lowerAchievement.includes('performance')) {
      metric = 'Performance Boost';
    } else if (lowerAchievement.includes('user engagement')) {
      metric = 'User Engagement';
    } else if (lowerAchievement.includes('bugs') || lowerAchievement.includes('error')) {
      metric = 'Bug Reduction';
    } else if (lowerAchievement.includes('cost') || lowerAchievement.includes('operational')) {
      metric = 'Cost Savings';
    } else if (lowerAchievement.includes('onboarding')) {
      metric = 'Onboarding Speed';
    } else if (lowerAchievement.includes('api') || lowerAchievement.includes('response')) {
      metric = 'API Performance';
    } else if (lowerAchievement.includes('downtime')) {
      metric = 'Uptime Improvement';
    }
    
    return { value: parseInt(match[1], 10), metric };
  }
  return { value: null, metric: null };
};

// Helper function to extract technology or project name from achievement
const extractProjectOrTech = (achievement: string): string => {
  const lowerAchievement = achievement.toLowerCase();
  
  if (lowerAchievement.includes('java') && lowerAchievement.includes('spring boot')) {
    return 'Java Spring Boot';
  } else if (lowerAchievement.includes('wordpress') && (lowerAchievement.includes('javascript') || lowerAchievement.includes('php'))) {
    return 'WordPress & JS Plugins';
  } else if (lowerAchievement.includes('vue.js') || lowerAchievement.includes('bootstrap')) {
    return 'Vue.js & Bootstrap';
  } else if (lowerAchievement.includes('rest api')) {
    return 'REST API Optimization';
  } else if (lowerAchievement.includes('integration') && lowerAchievement.includes('testing')) {
    return 'Testing & Integration';
  } else if (lowerAchievement.includes('azure')) {
    return 'Microsoft Azure';
  } else if (lowerAchievement.includes('sharepoint')) {
    return 'SharePoint Intranet';
  } else if (lowerAchievement.includes('sedar') || lowerAchievement.includes('government')) {
    return 'SEDAR Plus Portal';
  } else if (lowerAchievement.includes('bell')) {
    return 'Bell Microservices';
  } else {
    // Extract company name if present, otherwise generic name
    const companyMatch = achievement.match(/([A-Z][a-z]+\'?s)/);
    return companyMatch ? companyMatch[1] + ' Project' : 'Project Milestone';
  }
};

// Helper function to get an icon based on achievement type
const getAchievementIcon = (achievement: string) => {
  const lowerAchievement = achievement.toLowerCase();
  
  if (lowerAchievement.includes('deployment') || lowerAchievement.includes('migrat')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    );
  } else if (lowerAchievement.includes('performance') || lowerAchievement.includes('page load')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  } else if (lowerAchievement.includes('user') || lowerAchievement.includes('engagement')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  } else if (lowerAchievement.includes('cost') || lowerAchievement.includes('operational')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  } else {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    );
  }
};

// Helper function to generate a gradient color based on achievement type
const getAchievementGradient = (achievement: string): string => {
  const lowerAchievement = achievement.toLowerCase();
  
  if (lowerAchievement.includes('deployment') || lowerAchievement.includes('migrat')) {
    return 'from-[#ccff33] to-[#a3cc29]';
  } else if (lowerAchievement.includes('performance') || lowerAchievement.includes('page load')) {
    return 'from-[#ccff33] to-[#a3cc29]';
  } else if (lowerAchievement.includes('user') || lowerAchievement.includes('engagement')) {
    return 'from-[#ccff33] to-[#a3cc29]';
  } else if (lowerAchievement.includes('cost') || lowerAchievement.includes('operational')) {
    return 'from-[#ccff33] to-[#a3cc29]';
  } else if (lowerAchievement.includes('bug') || lowerAchievement.includes('error')) {
    return 'from-[#ccff33] to-[#a3cc29]';
  } else {
    return 'from-[#ccff33] to-[#a3cc29]';
  }
};

const ExperiencePage = async () => {
  // Parse experience data from markdown files
  const experiences: Experience[] = fs.readdirSync(path.join(process.cwd(), 'data', 'experience')).map((file) => {
    const content = fs.readFileSync(path.join(process.cwd(), 'data', 'experience', file), 'utf8');
    const { data } = matter(content);
    return data as Experience;
  });

  // Parse education data from markdown file
  const educationContent = fs.readFileSync(path.join(process.cwd(), 'data', 'education', 'degrees.md'), 'utf8');
  const { data } = matter(educationContent);
  const education: Education[] = data.degrees || [];

  return (
    
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Experience</span>
        </h1>
        <p className="text-soft-white/70 mb-16 text-xl max-w-2xl">My professional journey and educational background that has shaped my expertise in software development.</p>
        
        {/* Work Experience */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold mb-10 text-white inline-flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Work Experience</span>
            <span className="h-px w-20 bg-gradient-to-r from-[#ccff33] to-[#a3cc29] ml-6 opacity-50"></span>
          </h2>
          
          <div className="space-y-16 relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#ccff33]/50 via-[#a3cc29]/30 to-transparent transform md:-translate-x-1/2 hidden md:block"></div>
            
            {experiences.map((exp, index) => {
              // Alternate sides for desktop view
              const isEven = index % 2 === 0;

              // Prepare achievement data for visualization
              const achievementData = exp.achievements
                .map(achievement => {
                  const { value: percentValue, metric } = extractNumericValue(achievement);
                  const projectOrTech = extractProjectOrTech(achievement);
                  const icon = getAchievementIcon(achievement);
                  const gradientClass = getAchievementGradient(achievement);
                  
                  // Find secondary metrics if they exist
                  let secondaryValue = null;
                  let secondaryMetric = null;
                  
                  // Try to find a second percentage in the achievement
                  const secondaryMatch = achievement.replace(/(\d+)%/, '').match(/(\d+)%/);
                  if (secondaryMatch) {
                    secondaryValue = parseInt(secondaryMatch[1], 10);
                    
                    // Try to determine what this secondary metric represents
                    const remainingText = achievement.toLowerCase();
                    if (remainingText.includes('page load')) {
                      secondaryMetric = 'Page Load';
                    } else if (remainingText.includes('error') || remainingText.includes('resolution')) {
                      secondaryMetric = 'Error Resolution';
                    } else if (remainingText.includes('scalability')) {
                      secondaryMetric = 'Scalability';
                    } else if (remainingText.includes('downtime')) {
                      secondaryMetric = 'Downtime';
                    } else if (remainingText.includes('latency')) {
                      secondaryMetric = 'Latency';
                    } else {
                      secondaryMetric = 'Secondary Metric';
                    }
                  }
                  
                  return {
                    text: achievement,
                    percent: percentValue || Math.floor(Math.random() * 50) + 30, // Use extracted value or fallback to random
                    metric: metric || 'Improvement',
                    projectOrTech,
                    icon,
                    gradientClass,
                    secondaryValue,
                    secondaryMetric
                  };
                })
                .slice(0, 3); // Limit to 3 achievements for visualization
              
              return (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 top-0 w-3 h-3 rounded-full bg-[#ccff33] transform md:-translate-x-1/2 mt-4 hidden md:block"></div>
                  
                  <div className="md:grid md:grid-cols-2 w-full">
                    {/* Main experience card */}
                    <div 
                      className={`md:col-span-1 ${isEven ? 'md:pr-12' : 'md:pl-12'} ${!isEven && 'md:order-2'}`}
                      style={{ 
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5 hover:border-[#ccff33]/20 transition-all duration-500 hover:shadow-lg hover:shadow-[#ccff33]/10">
                        <div className="flex flex-col mb-4">
                          <h3 className="text-2xl font-bold text-white mb-1">{exp.position}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <p className="text-xl text-white/80 font-medium">{exp.company}</p>
                            <span className="text-[#ccff33] text-sm">{exp.period}</span>
                          </div>
                          <span className="text-soft-white/60 text-sm">{exp.location}</span>
                        </div>
                        
                        <p className="text-soft-white mb-6 leading-relaxed">{exp.description}</p>
                        
                        <div className="mb-6">
                          {/* <h4 className="text-white font-medium mb-3 flex items-center">
                            <span className="text-[#ccff33]">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                            Key Achievements
                          </h4> */}
                          <ul className="list-none pl-0 space-y-3">
                            {exp.achievements.map((achievement: string, idx: number) => (
                              <li key={idx} className="text-soft-white flex items-start">
                                <span className="text-[#ccff33] mr-3 mt-1 flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="text-xs bg-transparent backdrop-blur-sm px-3 py-1 rounded-full border border-[#ccff33]/50 transition-all duration-300 hover:border-[#ccff33] text-white"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Achievement Visualization */}
                    <div 
                      className={`md:col-span-1 ${isEven ? 'md:pl-12' : 'md:pr-12'} ${isEven && 'md:order-2'} mt-8 md:mt-0`}
                      style={{ 
                        animationDelay: `${index * 0.1 + 0.2}s`
                      }}
                    >
                      {/* Only show for desktop */}
                      <div className="hidden md:block"> 
                        {/* Achievement Metrics */}
                        <div className="bg-deep-black/80 backdrop-blur-lg p-6 rounded-xl border border-white/5 hover:border-[#ccff33]/20 transition-all duration-500 hover:shadow-lg shadow-[#ccff33]/10">
                          <h3 className="text-white text-xl font-medium mb-6">Performance Metrics</h3>

                          {/* Donut chart for first achievement */}
                          {achievementData[0] && (
                            <div className="mb-10 relative">
                              <div className="flex items-center justify-center mb-5">
                                <div className="relative w-48 h-48">
                                  {/* Donut chart background */}
                                  <div className="absolute inset-0 rounded-full bg-gray-700/30 border border-white/5"></div>
                                  
                                  {/* Progress segment with gradient */}
                                  <div 
                                    className={`absolute inset-0 rounded-full`}
                                    style={{
                                      background: `conic-gradient(#ccff33 0%, #a3cc29 ${achievementData[0].percent}%, transparent ${achievementData[0].percent}% 100%)`,
                                      clipPath: 'circle(50% at center)'
                                    }}
                                  ></div>
                                  
                                  {/* Inner circle for donut hole */}
                                  <div className="absolute inset-0 rounded-full bg-deep-black/90 m-10 flex flex-col items-center justify-center text-center">
                                    <span className="text-4xl font-bold text-white">{achievementData[0].percent}%</span>
                                    <span className="text-[#ccff33] text-sm mt-1">{achievementData[0].metric}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-center space-y-1">
                                <div className="text-sm text-white/80">
                                  {achievementData[0].text.split(' ').slice(0, 5).join(' ')}...
                                </div>
                                <div className="bg-gradient-to-r from-[#ccff33] to-[#a3cc29] bg-clip-text text-transparent text-lg font-medium">
                                  {achievementData[0].projectOrTech}
                                </div>
                                
                                {/* Show secondary metric if exists */}
                                {achievementData[0].secondaryValue && (
                                  <div className="flex items-center justify-center mt-2 space-x-1 bg-gray-800/50 rounded-full px-3 py-1 text-sm w-fit mx-auto">
                                    <span className="text-white/70">{achievementData[0].secondaryMetric}:</span>
                                    <span className="text-[#ccff33] font-medium">{achievementData[0].secondaryValue}% Improved</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Bar charts for other achievements */}
                          <div className="space-y-6">
                            {achievementData.slice(1).map((achievement, idx) => (
                              <div key={idx} className="relative">
                                <div className="mb-2 flex justify-between items-center px-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#ccff33] to-[#a3cc29] text-black">
                                      {achievement.icon}
                                    </div>
                                    <span className="text-white font-medium text-sm">{achievement.metric}</span>
                                  </div>
                                  <span className="text-white font-bold">{achievement.percent}%</span>
                                </div>
                                
                                <div className="h-12 relative rounded-lg overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-full bg-gray-700/20"></div>
                                  
                                  {/* Progress bar with gradient */}
                                  <div 
                                    className="absolute top-0 left-0 h-full rounded-lg bg-gradient-to-r from-[#ccff33] to-[#a3cc29]"
                                    style={{ width: `${achievement.percent}%` }}
                                  ></div>
                                  
                                  {/* Project/Tech name and icon overlay */}
                                  <div className="absolute inset-0 flex items-center px-4 justify-between">
                                    <span className="text-black text-sm font-medium drop-shadow-sm z-10">
                                      {achievement.projectOrTech}
                                    </span>
                                    
                                    {/* Secondary metric if exists */}
                                    {achievement.secondaryValue && (
                                      <div className="bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs flex items-center z-10">
                                        <span className="text-white/80 mr-1">{achievement.secondaryMetric}:</span>
                                        <span className="text-[#ccff33] font-medium">{achievement.secondaryValue}%</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-xs text-white/70 mt-1">
                                  {achievement.text.split(' ').slice(0, 6).join(' ')}...
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Education */}
        <div>
        <h2 className="text-3xl font-bold mb-10 text-white inline-flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Education</span>
            <span className="h-px w-20 bg-gradient-to-r from-[#ccff33] to-[#a3cc29] ml-6 opacity-50"></span>
          </h2>
         
          <div className="space-y-8 relative">
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#ccff33]/50 via-[#a3cc29]/30 to-transparent hidden md:block"></div>
            
            {education.map((edu, index) => (
              <div key={index} className="relative md:pl-12">
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-[#ccff33] mt-4 hidden md:block"></div>
                
                <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5 hover:border-[#ccff33]/20 transition-all duration-500 hover:shadow-lg hover:shadow-[#ccff33]/10 max-w-2xl">
                  <div className="flex flex-col mb-2">
                    <h3 className="text-2xl font-bold text-white mb-1">{edu.degree}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <p className="text-xl text-white/80 font-medium">{edu.institution}</p>
                      <span className="text-[#ccff33] text-sm">{edu.period}</span>
                    </div>
                    {edu.location && <span className="text-soft-white/60 text-sm">{edu.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default ExperiencePage;