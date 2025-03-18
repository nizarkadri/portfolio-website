// components/Navbar.tsx
"use client"; // This is now a Client Component

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 md:px-8 py-3 rounded-full ${
        scrolled 
          ? 'bg-deep-black/70 backdrop-blur-xl w-[95%] md:w-auto shadow-floating' 
          : 'bg-transparent md:bg-deep-black/30 md:backdrop-blur-lg md:shadow-floating'
      } transition-all duration-300`}>
        <div className="flex items-center justify-between h-10">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <span className="font-black text-xl text-white tracking-tighter">
              NK<span className="text-white/50">.</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-12">
            <NavLink href="/" isActive={pathname === '/'} label="Home" />
            <NavLink href="/about" isActive={pathname === '/about'} label="About" />
            <NavLink href="/projects" isActive={pathname === '/projects'} label="Projects" />
            <NavLink href="/experience" isActive={pathname === '/experience'} label="Experience" />
            <NavLink href="/contact" isActive={pathname === '/contact'} label="Contact" />
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`fixed inset-0 z-40 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 w-[90%] max-w-sm">
          <div className="flex justify-between items-center mb-10">
            <span className="text-2xl font-black text-white tracking-tighter">NAVIGATON<span className="text-white/50">.</span></span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-8">
            <MobileNavLink href="/" isActive={pathname === '/'} label="HOME" />
            <MobileNavLink href="/about" isActive={pathname === '/about'} label="ABOUT" />
            <MobileNavLink href="/projects" isActive={pathname === '/projects'} label="PROJECTS" />
            <MobileNavLink href="/experience" isActive={pathname === '/experience'} label="EXPERIENCE" />
            <MobileNavLink href="/contact" isActive={pathname === '/contact'} label="CONTACT" />
          </div>
        </div>
      </div>
    </>
  );
};

interface NavLinkProps {
  href: string;
  isActive: boolean;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, isActive, label }) => {
  return (
    <Link href={href} className="group">
      <div className="relative py-1 overflow-hidden">
        <span className={`text-xs tracking-widest uppercase font-medium transition-colors ${
          isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'
        }`}>
          {label}
        </span>
        {isActive && (
          <div className="absolute bottom-0 left-0 w-full h-px bg-white/30"></div>
        )}
        <div className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300 ease-in-out"></div>
      </div>
    </Link>
  );
};

interface MobileNavLinkProps {
  href: string;
  isActive: boolean;
  label: string;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, isActive, label }) => {
  return (
    <Link 
      href={href} 
      className={`group block relative overflow-hidden py-2 transition-colors ${
        isActive 
          ? 'text-white' 
          : 'text-white/50 hover:text-white'
      }`}
      onClick={() => document.body.style.overflow = "auto"}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl font-black tracking-tighter">{label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <div className={`absolute bottom-0 left-0 h-px w-full bg-white ${isActive ? 'opacity-30' : 'opacity-10 group-hover:opacity-20'}`}></div>
    </Link>
  );
};

export default Navbar;