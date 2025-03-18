import React from 'react';

export default function ExperiencePage() {
  const experiences = [
    {
      id: 1,
      company: 'CGI',
      position: 'Software Engineer',
      period: 'Jun 2022 - Dec 2024',
      location: 'Toronto, Canada',
      description: 'Led development of high-performance applications and optimized existing systems.',
      achievements: [
        'Reduced deployment time by 40% and enhanced scalability significantly by migrating Bell\'s monolithic Java application to a microservices architecture using Spring Boot.',
        'Improved website performance by 70% and achieved 98% WCAG 2.1 accessibility by completely redesigning Ontario\'s government SEDAR Plus website.',
        'Increased user engagement by 35% and reduced page load time by 25% by researching and developing customized WordPress plugins using JavaScript and PHP.',
        'Improved cross-browser compatibility by 50% and enhanced UI responsiveness by 30% through designing dynamic interfaces with Vue.js and Bootstrap.',
        'Reduced production bugs by 45% and improved error resolution speed by 40% by implementing backend logic for account closure features and performing thorough integration and unit testing.',
        'Increased API response performance by 50% and reduced latency by 40% through optimization and efficient development of REST APIs.',
        'Reduced onboarding time by 60% through targeted knowledge transfer, mentorship, and training.'
      ],
      technologies: ['Java', 'Spring Boot', 'JavaScript', 'PHP', 'Vue.js', 'Bootstrap', 'REST API']
    },
    {
      id: 2,
      company: 'Fiera Capital Corp.',
      position: 'Cloud Administrator',
      period: 'Sept 2021 - May 2022',
      location: 'Toronto, Canada',
      description: 'Managed cloud infrastructure and optimized operations.',
      achievements: [
        'Reduced operational costs by 30% and server downtime by 25% through migrating over 20 on-premise servers to Microsoft Azure using ASR, Microsoft Cost Management and Azure Pricing Calculator.',
        'Increased employee engagement by 20% by developing and deploying a company-wide Microsoft SharePoint intranet site.'
      ],
      technologies: ['Microsoft Azure', 'ASR', 'Microsoft SharePoint', 'Cloud Migration']
    }
  ];

  const education = [
    {
      id: 1,
      institution: 'University of Windsor',
      degree: 'Master of Applied Computing (Specialized in AI/ML)',
      period: 'Sept 2020 - May 2022',
      location: 'Windsor, Canada'
    },
    {
      id: 2,
      institution: 'Ganpat Univeristy',
      degree: 'B.Tech in Computer Science (IBM Cloud Certified)',
      period: 'Aug 2016 - Aug 2020',
      location: 'Gujarat, India'
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-10 text-white">Experience</h1>
        
        {/* Work Experience */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-white">Work Experience</h2>
          
          <div className="space-y-12">
            {experiences.map((exp) => (
              <div key={exp.id} className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">{exp.position}</h3>
                  <span className="text-soft-white/70">{exp.period}</span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <p className="text-xl text-white/80">{exp.company}</p>
                  <span className="text-soft-white/70">{exp.location}</span>
                </div>
                
                <p className="text-soft-white mb-6">{exp.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Key Achievements:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {exp.achievements.map((achievement, index) => (
                      <li key={index} className="text-soft-white">{achievement}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech, index) => (
                    <span key={index} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Education */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-white">Education</h2>
          
          <div className="space-y-8">
            {education.map((edu) => (
              <div key={edu.id} className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                  <span className="text-soft-white/70">{edu.period}</span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <p className="text-lg text-white/80">{edu.institution}</p>
                  <span className="text-soft-white/70">{edu.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
