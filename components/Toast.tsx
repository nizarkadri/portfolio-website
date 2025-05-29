'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-20 left-1/3 transform -translate-x-1/3 z-[200] max-w-md w-full mx-5"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={`
              relative p-6 rounded-lg backdrop-blur-md border-2 border-[#B8E62D] inset-0
              ${type === 'success' 
                ? 'bg-transparent border-[#B8E62D]/40 text-[#B8E62D]' 
                : 'bg-transparent border-red-500/40 text-red-400'
              }
            `}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Toast content */}
            <div className="flex items-center space-x-3 pr-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                {type === 'success' ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M16.667 5L7.5 14.167L3.333 10" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M15 5L5 15M5 5L15 15" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>

              {/* Message */}
              <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              className={`absolute bottom-0 left-0 h-1 rounded-b-lg ${
                type === 'success' ? 'bg-[#B8E62D]' : 'bg-red-500'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 