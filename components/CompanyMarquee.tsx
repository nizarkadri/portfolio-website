'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Company {
  name: string;
  color: string;
  logo: string;
}

const companies: Company[] = [
  { name: 'CGI', color: '#DC2626', logo: '/images/companies/CGI.svg' }, // red-600
  { name: 'Fiera Capital', color: '#2563EB', logo: '/images/companies/Fiera_Capital.svg' }, // blue-600
  { name: 'Bell', color: '#1D4ED8', logo: '/images/companies/Bell.svg' }, // blue-700
  { name: 'Canadian Securities Administrators', color: '#FFFFFF', logo: '' }, // white
  { name: 'TechSym Solutions', color: '#FFFFFF', logo: '' }, // white
];

const CompanyMarquee: React.FC = () => {
  // Triple companies for smoother infinite scroll
  const extendedCompanies = [...companies, ...companies, ...companies];

    return (
    <section className="relative w-full overflow-hidden mb-16 md:mb-24">
      {/* Minimalist container */}
      <div className="relative py-12 md:py-16">
        
        {/* Subtle section label with animations */}
        <div 
          className="text-center mb-12 md:mb-16 opacity-0 translate-y-5 animate-fade-in"
          style={{ 
            animationDelay: '0.2s',
            animationFillMode: 'forwards'
          }}
        >
          <p 
            className="text-sm md:text-base font-light tracking-[0.3em] uppercase text-gray-500 mb-3 opacity-0 animate-fade-in"
            style={{ 
              animationDelay: '0.4s',
              animationFillMode: 'forwards'
            }}
          >
            Previously
          </p>
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-extralight tracking-[0.1em] text-white opacity-0 translate-y-2 animate-fade-in"
            style={{ 
              animationDelay: '0.6s',
              animationFillMode: 'forwards'
            }}
          >
            Worked <span className="text-[#B8E62D] font-light">With</span>
          </h2>
        </div>

        {/* Ultra-thin top border */}
        <div 
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-800/50 to-transparent scale-x-0 animate-slide-in"
          style={{ 
            animationDelay: '0.8s',
            animationFillMode: 'forwards',
            transformOrigin: 'center'
          }}
        />

        {/* Sleek marquee track */}
        <div className="relative overflow-hidden bg-gradient-to-r from-black via-gray-950/50 to-black py-8 md:py-10">
          {/* Primary marquee with CSS animation */}
          <div className="flex animate-scroll hover:animate-pause">
            {extendedCompanies.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="inline-flex items-center mx-8 md:mx-16 lg:mx-20 flex-shrink-0 hover:scale-105 transition-transform duration-200 ease-out"
              >
                {company.logo ? (
                  <Link 
                  href="/experience" 
                  aria-label={`View experience related to ${company.name}`}
                >
                  <div className="relative group cursor-pointer">
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      width={120}
                      height={40}
                      className="h-8 md:h-10 lg:h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-300"
                    />
                  </div>
                </Link> 
                ) : (
                  <Link 
                  href="/experience" 
                  aria-label={`View experience related to ${company.name}`}
                >
                  <span
                    className="text-xl md:text-2xl lg:text-3xl font-thin tracking-[0.15em] transition-all duration-500 cursor-pointer relative hover:tracking-[0.2em]"
                    style={{ 
                      color: company.color === '#FFFFFF' ? '#D1D5DB' : company.color,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {company.name}
                    
                    {/* Subtle underline on hover */}
                    <div className="absolute -bottom-1 left-0 h-px bg-current opacity-0 w-0 hover:w-full hover:opacity-60 transition-all duration-400 ease-out" />
                  </span>
                  </Link>
                )}

                {/* Refined separator with hover effects */}
                <div 
                  className="w-px h-8 ml-12 md:ml-16 lg:ml-20 bg-gray-800/60 hover:bg-current hover:h-8 transition-all duration-300 ease-out"
                  style={{
                    color: company.color,
                    filter: 'drop-shadow(0 0 4px currentColor)'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Subtle edge fade with enhanced gradient */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-black via-gray-950/90 to-transparent pointer-events-none z-20" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-black via-gray-950/90 to-transparent pointer-events-none z-20" />
        </div>

        {/* Ultra-thin bottom border with subtle glow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/80 to-transparent scale-x-0 animate-slide-in"
          style={{ 
            animationDelay: '1.2s',
            animationFillMode: 'forwards',
            transformOrigin: 'center'
          }}
        />

        {/* Signature accent line */}
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 md:w-32 h-px bg-[#B8E62D]/80 scale-x-0 animate-slide-in"
          style={{ 
            boxShadow: '0 0 8px rgba(184, 230, 45, 0.3)',
            animationDelay: '1.6s',
            animationFillMode: 'forwards',
            transformOrigin: 'center'
          }}
        />
      </div>
    </section>
  );
};

export default CompanyMarquee;
