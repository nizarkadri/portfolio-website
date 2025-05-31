'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z, ZodError } from 'zod';


// import { downloadLatexFile, copyToClipboard } from '../utils/resumeUtils';

import Toast from './Toast';

interface ResumeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   resume?: string;
//   email?: string;
//   error?: string;
// }

const ResumeRequestModal = ({ isOpen, onClose }: ResumeRequestModalProps) => {

  const resumeSchema = z.object({
    userType: z.literal('resume_request'), // required!
    email: z.string().email(),
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
    message: z.string(),
  })

  const [formData, setFormData] = useState({
    email: '',
    jobDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  // const [generatedResume, setGeneratedResume] = useState<string>('');
  
  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  // Show toast function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  // Hide toast function
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {

      const parsed = resumeSchema.safeParse({
        userType: 'resume_request',
        email: formData.email,
        jobDescription: formData.jobDescription,
        message: `Resume request for: ${formData.jobDescription}`,
      });

      if (!parsed.success) {
        // console.error('Validation error:', parsed.error);
        setSubmitStatus('error');
        if (parsed.error instanceof ZodError) {
          const messages = parsed.error.errors.map(err => err.message).join('\n');
          // console.error(messages);
          setErrorMessage(messages);
          return;
        }
        setErrorMessage('An unknown validation error occurred');
        return;
      }
      // Use contact API instead of generateResume API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType: 'resume_request',
          email: formData.email,
          jobDescription: formData.jobDescription,
          message: `Resume request for the following position:\n\n${formData.jobDescription}`,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Set a success message instead of generated resume
        // setGeneratedResume('Resume request sent successfully! You will receive a tailored resume shortly.');
        console.log('Resume request sent successfully');
        
        // Show success toast
        showToast('Resume request sent successfully! You will receive my resume shortly.', 'success');
        
        handleClose();
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setErrorMessage(errorData.message || 'Failed to send resume request');
        
        // Show error toast
        showToast(errorData.message || 'Failed to send resume request', 'error');
      }

      // Keep the original generateResume code for future use
      /*
      const response = await fetch('/api/generateResume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          jobDescription: formData.jobDescription,
        }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setGeneratedResume(data.resume || '');
        console.log('Resume generated successfully:', data.resume);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to generate resume');
      }
      */
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
      
      // Show error toast
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle download
  // const handleDownload = () => {
  //   if (generatedResume) {
  //     downloadLatexFile(generatedResume, `tailored_resume_${Date.now()}.tex`);
  //   }
  // };

  // // Handle copy to clipboard
  // const handleCopy = async () => {
  //   if (generatedResume) {
  //     const success = await copyToClipboard(generatedResume);
  //     if (success) {
  //       // You could show a toast notification here
  //       console.log('Resume copied to clipboard');
  //     }
  //   }
  // };

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({ email: '', jobDescription: '' });
    setSubmitStatus('idle');
    setErrorMessage('');
    // setGeneratedResume('');
    onClose();
  };

  return (
    <>
      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={4000}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            
            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-md bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#B8E62D]/20 rounded-2xl p-8 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Modal Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Request Resume</h2>
                <p className="text-white/60 text-sm">
                  Please provide your email and job description to receive my resume.
                </p>
              </div>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  className="mb-4 p-4 bg-[#B8E62D]/20 border border-[#B8E62D]/40 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-[#B8E62D] text-sm font-medium mb-3">
                    ✓ Resume request sent successfully!
                  </p>
                  <p className="text-white/70 text-xs">
                    Your request has been received. You will receive my resume at the provided email address shortly.
                  </p>
                  {/* Keep original download/copy buttons for future resume generation feature */}
                  {/*
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 px-3 py-2 bg-[#B8E62D] text-black text-xs font-medium rounded hover:bg-[#a3cc29] transition-colors"
                    >
                      Download .tex
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex-1 px-3 py-2 bg-transparent border border-[#B8E62D] text-[#B8E62D] text-xs font-medium rounded hover:bg-[#B8E62D]/10 transition-colors"
                    >
                      Copy LaTeX
                    </button>
                  </div>
                  */}
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-red-400 text-sm font-medium">
                    ✗ {errorMessage}
                  </p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#B8E62D]/50 focus:ring-2 focus:ring-[#B8E62D]/20 transition-all duration-200 disabled:opacity-50"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Job Description Input */}
                <div>
                  <label htmlFor="jobDescription" className="block text-sm font-medium text-white/80 mb-2">
                    Job Description
                  </label>
                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#B8E62D]/50 focus:ring-2 focus:ring-[#B8E62D]/20 transition-all duration-200 resize-none disabled:opacity-50"
                    placeholder="Please describe the position you're hiring for..."
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#B8E62D] text-black font-semibold rounded-lg transition-all duration-300 hover:bg-[#a3cc29] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Sending Request...</span>
                    </div>
                  ) : (
                    'Send Resume Request'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResumeRequestModal; 