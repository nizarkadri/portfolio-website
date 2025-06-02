// components/Navbar.tsx
"use client"; // This is now a Client Component

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock/unlock body scroll when mobile menu is open/closed
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-4  transform -translate-x-1/2 z-50 px-6 md:px-12 md:left-1/4  py-3 rounded-full ${
          scrolled 
            ? 'bg-deep-black/70 backdrop-blur-xl w-[95%] md:w-auto shadow-floating' 
            : 'bg-transparent md:bg-deep-black/30 md:backdrop-blur-lg md:shadow-floating'
        } transition-all duration-300`}
      >
        <div className="flex items-center justify-between h-10 md:h-10 relative">
          {/* Logo positioned on the left with enough margin */}
          <div className="md:w-24 flex items-center justify-start">
            <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
              <motion.span 
                className="text-white font-black text-xl" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                NK<span className="text-[#8acea2]">.</span>
              </motion.span>
            </Link>
          </div>

          {/* Desktop menu - centered with equal space on both sides */}
          <div className="hidden md:flex items-center justify-center space-x-12">
            <NavLink href="/" isActive={pathname === '/'} label="Home" />
            <NavLink href="/about" isActive={pathname === '/about'} label="About" />
            <NavLink href="/projects" isActive={pathname === '/projects'} label="Projects" />
            <NavLink href="/experience" isActive={pathname === '/experience'} label="Experience" />
            <NavLink href="/contact" isActive={pathname === '/contact'} label="Contact" />
          </div>

          {/* Empty div to balance the layout */}
          <div className="hidden md:block md:w-24"></div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="relative z-50 w-10 h-10 flex items-center justify-center focus:outline-none " 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <motion.span
                  animate={{
                    rotate: mobileMenuOpen ? 45 : 0,
                    y: mobileMenuOpen ? 8 : 0
                  }}
                  className="absolute top-0 left-0 w-6 h-0.5 bg-white"
                />
                <motion.span
                  animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                  className="absolute top-[11px] left-0 w-6 h-0.5 bg-white"
                />
                <motion.span
                  animate={{
                    rotate: mobileMenuOpen ? -45 : 0,
                    y: mobileMenuOpen ? -8 : 0
                  }}
                  className="absolute bottom-0 left-0 w-6 h-0.5 bg-white"
                />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Animated mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 w-[90%] max-w-sm"
            >
              <div className="flex justify-between items-center mb-10">
                <motion.span 
                  className="text-2xl font-black text-white tracking-tighter"
                  animate={{ 
                    x: [0, 5, 0],
                    transition: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                  }}
                >
                  MENU<span className="text-[#8acea2]">.</span>
                </motion.span>
              </div>
              <div className="space-y-8">
                <MobileNavLink href="/" isActive={pathname === '/'} label="HOME" />
                <MobileNavLink href="/about" isActive={pathname === '/about'} label="ABOUT" />
                <MobileNavLink href="/projects" isActive={pathname === '/projects'} label="PROJECTS" />
                <MobileNavLink href="/experience" isActive={pathname === '/experience'} label="EXPERIENCE" />
                <MobileNavLink href="/contact" isActive={pathname === '/contact'} label="CONTACT" />
              </div>
              
              {/* Social links */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-16 flex justify-center space-x-6"
              >
                <SocialIcon href="https://github.com" label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://linkedin.com" label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://twitter.com" label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </SocialIcon>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
      <Link href={href} className="group">
        <div className="relative py-1 overflow-hidden">
          <span className={`text-xs tracking-widest uppercase font-medium transition-colors ${
            isActive ? 'text-[white]' : 'text-white/60 group-hover:text-white/90'
          }`}>
            {label}
          </span>
          {isActive && (
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-px bg-[#B8E62D]/80"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          )}
          <motion.div 
            className="absolute bottom-0 left-0 w-0 h-px bg-[#8acea2]"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

interface MobileNavLinkProps {
  href: string;
  isActive: boolean;
  label: string;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, isActive, label }) => {
  return (
    <motion.div whileHover={{ x: 5 }} whileTap={{ x: 0 }}>
      <Link 
        href={href} 
        className={`group block relative overflow-hidden py-2 transition-colors ${
          isActive 
            ? 'text-[#B8E62D]' 
            : 'text-white/70 hover:text-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black tracking-tighter">{label}</span>
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${isActive ? 'opacity-100 text-[#8acea2]' : 'opacity-0 group-hover:opacity-50'}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
            animate={isActive ? { x: [0, 5, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </motion.svg>
        </div>
        <motion.div 
          className={`absolute bottom-0 left-0 h-px w-full ${isActive ? 'bg-[#8acea2] opacity-70' : 'bg-white opacity-10 group-hover:opacity-20'}`}
          whileHover={{ scaleX: 1.1 }}
        ></motion.div>
      </Link>
    </motion.div>
  );
};

interface SocialIconProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, label, children }) => {
  return (
    <motion.a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="text-white/70 hover:text-[#8acea2] transition-colors"
      whileHover={{ scale: 1.2, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.a>
  );
};

export default Navbar;