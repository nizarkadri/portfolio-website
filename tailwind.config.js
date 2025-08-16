/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
  
      // Or if using `src` directory:
      // './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
      darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['var(--font-inter)'], // Use the CSS variable
          montserrat: ['var(--font-montserrat)', 'sans-serif'],
        },
        colors: {
          transparent: 'transparent',
          current: 'currentColor',
          deep: {
            black: '#080808',
            gray: '#111111', 
            charcoal: '#151515'
          },
          soft: {
            black: '#1a1a1a',
            white: '#f8f8f8',
            gray: '#a0a0a0'
          },
          cushion: {
            white: '#f0f0f0',
            gray: '#e0e0e0'
          },
          black: {
            100: '#e6e6e6',
            200: '#cccccc',
            300: '#b3b3b3',
            400: '#999999',
            500: '#808080',
            600: '#666666',
            700: '#4d4d4d',
            800: '#333333',
            900: '#1a1a1a',
            950: '#0c0c0c',
            DEFAULT: '#080808',
          },
          white: {
            DEFAULT: '#f8f8f8',
          },
          gray: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
            950: '#0a0a0a',
          },
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        },
        borderRadius: {
          none: '0',
          'sm': '0.25rem',
          DEFAULT: '0.375rem',
          'md': '0.5rem',
          'lg': '0.75rem',
          'xl': '1rem',
          'full': '9999px',
        },
        boxShadow: {
          'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'inner-white': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
          'inner-black': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
          'floating': '0 8px 32px rgba(0, 0, 0, 0.2)',
          'subtle': '0 2px 10px rgba(0, 0, 0, 0.05)',
        },
        transitionProperty: {
          'height': 'height',
          'spacing': 'margin, padding',
          'transform': 'transform',
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in forwards',
          'slide-up': 'slideUp 0.5s ease-out forwards',
          'float': 'float 6s ease-in-out infinite',
          'float-slow': 'float 10s ease-in-out infinite',
          'float-delayed': 'float 8s ease-in-out infinite 1s',
          'rotate-3d': 'rotate3d 8s linear infinite',
          'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'glow': 'glow 3s ease-in-out infinite alternate',
          'scroll': 'scroll 30s linear infinite',
          'pause': 'scroll 30s linear infinite paused',
          'slide-in': 'slideIn 1.5s ease-out forwards',
        },
        keyframes: {
          scroll: {
            '0%': { transform: 'translateX(0%)' },
            '100%': { transform: 'translateX(-100%)' },
          },
          fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          slideIn: {
            '0%': { transform: 'scaleX(0)' },
            '100%': { transform: 'scaleX(1)' },
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }