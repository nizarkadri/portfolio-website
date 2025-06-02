'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import FormFieldError from '../../../components/FormFieldError';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Available user types for the contact form */
type UserType = 'recruiter' | 'client' | 'resume_request' | null;

/** Zod schema for recruiter form data */
const recruiterSchema = z.object({
  userType: z.literal('recruiter'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
  employmentType: z.string().min(2, 'Please specify the employment type'),
  interview: z.string().min(2, 'Please provide interview availability'),
  workLocation: z.string().min(2, 'Please specify the work location'),
  locationDetails: z.string().optional(),
  message: z.string().optional(),
});

/** Zod schema for client form data */
const clientSchema = z.object({
  userType: z.literal('client'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  projectType: z.string().min(2, 'Project type must be at least 2 characters'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

/** Zod schema for resume request form data (currently unused but kept for future use) */
const resumeSchema = z.object({
  userType: z.literal('resume_request'),
  email: z.string().email(),
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
  message: z.string(),
});

/** Type-safe error types for form validation */
type RecruiterErrors = FieldErrors<z.infer<typeof recruiterSchema>>;
type ClientErrors = FieldErrors<z.infer<typeof clientSchema>>;

/** Main contact form schema using discriminated union for type safety */
const contactSchema = z.discriminatedUnion('userType', [recruiterSchema, clientSchema, resumeSchema]);

/** Inferred type from the contact schema */
type ContactFormData = z.infer<typeof contactSchema>;

/** Submit status type for form submission feedback */
type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
} | null;

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/** Reusable animation variant for fade in up effect */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContactPage() {
  // ============================================================================
  // FORM SETUP
  // ============================================================================
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
  });

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /** Current step in the multi-step form */
  const [step, setStep] = useState<number>(0);
  
  /** Current user type, watched from form */
  const userType = watch('userType') as UserType;
  
  /** Form submission loading state */
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  /** Form submission status for user feedback */
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  
  /** Timeline counter for client projects (in days) */
  const [timelineDays, setTimelineDays] = useState<number>(30);
  
  /** Project type dropdown open/closed state */
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);
  
  // ============================================================================
  // TYPE-SAFE ERROR HANDLING
  // ============================================================================
  
  /** Type-safe recruiter form errors */
  const recruiterErrors = errors as RecruiterErrors;
  
  /** Type-safe client form errors */
  const clientErrors = errors as ClientErrors;

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /** Format budget input to only allow numbers, commas, and hyphens */
  const formatBudgetInput = (value: string): string => {
    return value.replace(/[^0-9,-]/g, '');
  };

  /** Handle budget input change with formatting */
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const formatted = formatBudgetInput(e.target.value);
    setValue('budget', formatted, { shouldValidate: true });
  };

  /** Update timeline with bounds checking (1-365 days) */
  const updateTimeline = (days: number): void => {
    const newDays = Math.max(1, Math.min(365, days));
    setTimelineDays(newDays);
    setValue('timeline', `${newDays} days`, { shouldValidate: true });
  };

  /** Handle project type selection and close dropdown */
  const handleProjectTypeSelect = (projectType: string): void => {
    setValue('projectType', projectType, { shouldValidate: true });
    setIsProjectDropdownOpen(false);
  };

  /** Handle user type selection and advance to next step */
  const handleUserTypeSelection = (type: UserType): void => {
    setValue('userType', type as 'recruiter' | 'client');
    setStep(1);
  };

  // ============================================================================
  // CONSTANTS
  // ============================================================================

  /** Available project types for client selection */
  const projectTypes: readonly string[] = [
    'Website',
    'Web Application',
    'Mobile App (iOS)',
    'Mobile App (Android)',
    'Mobile App (Cross-platform)',
    'E-commerce Platform',
    'Portfolio Website',
    'Landing Page',
    'Dashboard/Admin Panel',
    'API Development',
    'Database Design',
    'UI/UX Design',
    'WordPress Site',
    'Custom Software',
    'SaaS Platform',
    'Progressive Web App (PWA)',
    'Chrome Extension',
    'Desktop Application',
    'Game Development',
    'Blockchain/Web3 Project',
    'AI/ML Integration',
    'Data Visualization',
    'CRM System',
    'Booking/Reservation System',
    'Educational Platform',
    'Social Media Platform',
    'Other'
  ] as const;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /** Handle clicking outside dropdown to close it */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (isProjectDropdownOpen && !target.closest('.dropdown-container')) {
        setIsProjectDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProjectDropdownOpen]);

  // ============================================================================
  // FORM NAVIGATION
  // ============================================================================
  
  /** Calculate total steps based on user type */
  const getTotalSteps = (): number => {
    if (!userType) return 1; // Initial step to select user type
    return userType === 'recruiter' ? 8 : 7; // Different steps for each user type
  };
  
  /** Navigate to next step */
  const handleNextStep = (): void => {
    if (step < getTotalSteps() - 1) {
      setStep(step + 1);
    }
  };
  
  /** Navigate to previous step */
  const handlePrevStep = (): void => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  /** Handle form submission with proper error handling */
  const onSubmit = async (data: ContactFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully! I will get back to you soon.',
      });
      reset();
      setStep(0);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send message',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  /** Render the appropriate form step based on current step and user type */
  const renderStep = (): React.ReactElement | null => {
    switch (step) {
      case 0:
        return (
          <motion.div 
            className="max-w-xl w-full mx-auto text-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            key="step-0"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
              Hey there! 
              <motion.span
                animate={{ 
                  rotate: [0, 20, -20, 0],
                  transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="inline-block ml-2"
              >
                👋
              </motion.span> 
              <br />Who do I have the <span className="text-[#B8E62D]">pleasure</span> of meeting?
            </h2>
            <p className="text-soft-white/70 mb-10">
              This helps me point you in the <span className="text-[#B8E62D]">right</span> direction and make our chat <span className="text-[#B8E62D]">super useful</span>! 
              <motion.span
                animate={{ 
                  scale: [1, 1.2, 1],
                  transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
                className="inline-block ml-1"
              >
                🎯
              </motion.span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                type="button"
                onClick={() => { handleUserTypeSelection('recruiter'); }}
                className={`p-6 rounded-xl border-2 ${userType === 'recruiter' ? 'border-[#B8E62D] bg-[#B8E62D]/10' : 'border-white/10 hover:border-[#B8E62D]/50'} transition-all`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto bg-[#B8E62D]/10 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ rotate: 5 }}
                >
                  <motion.span
                    animate={{ 
                      scale: [1, 1.1, 1],
                      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="text-2xl"
                  >
                    🧑‍💼
                  </motion.span>
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">I'm a Recruiter or Hiring Manager</h3>
                <p className="text-soft-white/70 text-sm">Looking to fill a role or discuss an <span className="text-[#B8E62D]">awesome</span> opportunity 🤝</p>
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => { handleUserTypeSelection('client'); }}
                className={`p-6 rounded-xl border-2 ${userType === 'client' ? 'border-[#B8E62D] bg-[#B8E62D]/10' : 'border-white/10 hover:border-[#B8E62D]/50'} transition-all`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto bg-[#B8E62D]/10 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ rotate: -5 }}
                >
                  <motion.span
                    animate={{ 
                      scale: [1, 1.1, 1],
                      transition: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                    }}
                    className="text-2xl"
                  >
                    💡
                  </motion.span>
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">I'm a Potential Client</h3>
                <p className="text-soft-white/70 text-sm">Got a project brewing? I'm here to help with <span className="text-[#B8E62D]">development</span>! 🚀</p>
              </motion.button>
            </div>
          </motion.div>
        );
        
      case 1:
        if (userType === 'client') {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-1-client"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                <span className="text-[#B8E62D]">Great</span> choice! So, who do I have the <span className="text-[#B8E62D]">pleasure</span> of chatting with? 
                <motion.span
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="inline-block ml-2"
                >
                  😊
                </motion.span>
              </h2>
              <p className="text-soft-white/70 mb-10">Let's get <span className="text-[#B8E62D]">acquainted</span>! I'm <span className="text-[#B8E62D]">excited</span> to learn your name.</p>
              
              <div className="space-y-2">
                <input
                  {...register('name')}
                  type="text"
                  className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-xl placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all"
                  placeholder="e.g., Alex Stellar ✨"
                  autoFocus
                />
                {clientErrors.name && (
                  <FormFieldError message={clientErrors.name.message} />
                )}
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-1-recruiter"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                <span className="text-[#B8E62D]">Perfect</span>! What <span className="text-[#B8E62D]">specific</span> role are you looking to fill? 
                <motion.span
                  animate={{ 
                    scale: [1, 1.3, 1],
                    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="inline-block ml-2"
                >
                  🎯
                </motion.span>
              </h2>
              <p className="text-soft-white/70 mb-10">Tell me about the <span className="text-[#B8E62D]">exciting</span> position you've got! ✨</p>
              
              <div className="space-y-2">
                <input
                  {...register('position')}
                  type="text"
                  className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-xl placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all"
                  placeholder="e.g. Frontend Developer, Full Stack Engineer"
                  autoFocus
                />
                {recruiterErrors.position && (
                  <FormFieldError message={recruiterErrors.position.message} />
                )}
              </div>
            </motion.div>
          );
        }
        
      case 2:
        if (userType === 'client') {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-2-client"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                Got it, <span className="text-[#B8E62D] font-bold">{watch('name') || 'friend'}</span>! What's the <span className="text-[#B8E62D]">best</span> email to reach you at? 
                <motion.span
                  animate={{ 
                    y: [0, -5, 0],
                    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="inline-block ml-2"
                >
                  📧
                </motion.span>
              </h2>
              <p className="text-soft-white/70 mb-10">This way, I can <span className="text-[#B8E62D]">easily</span> send you updates or follow-ups 📬</p>
              
              <div className="space-y-2">
                <input
                  {...register('email')}
                  type="email"
                  className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-xl placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all"
                  placeholder="e.g., alex@example.com"
                  autoFocus
                />
                {clientErrors.email && (
                  <FormFieldError message={clientErrors.email.message} />
                )}
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-2-recruiter"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">What position are you hiring for?</h2>
              <p className="text-soft-white/70 mb-10">What role are you looking to fill?</p>
              
              <div className="space-y-2">
                <input
                  {...register('position')}
                  type="text"
                  className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-xl placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all"
                  placeholder="e.g. Frontend Developer, Full Stack Engineer"
                  autoFocus
                />
                {recruiterErrors.position && (
                  <FormFieldError message={recruiterErrors.position.message} />
                )}
              </div>
            </motion.div>
          );
        }
        
      case 3:
        if (userType === 'client') {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-3-client"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                <span className="text-[#B8E62D]">Excellent</span>! What kind of <span className="text-[#B8E62D]">amazing</span> project are you dreaming up? 
                <motion.span
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="inline-block ml-2"
                >
                  🤔
                </motion.span>
              </h2>
              <p className="text-soft-white/70 mb-10">
                Let's dive into the type of services you're after 
                <motion.span
                  animate={{ 
                    scale: [1, 1.2, 1],
                    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="inline-block ml-1"
                >
                  🛠️
                </motion.span>
              </p>
              
              <div className="space-y-2">
                <div className="relative dropdown-container">
                  <motion.div
                    className={`w-full p-4 bg-white/5 border rounded-xl text-white text-xl focus:outline-none transition-all cursor-pointer ${
                      isProjectDropdownOpen 
                        ? 'border-[#B8E62D] ring-2 ring-[#B8E62D]/30' 
                        : 'border-[#B8E62D]/10 hover:border-[#B8E62D]/30'
                    }`}
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={watch('projectType') ? 'text-white' : 'text-soft-white/50'}>
                        {watch('projectType') || 'Choose a project category ✨'}
                      </span>
                      <motion.div
                        animate={{ rotate: isProjectDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg className="w-5 h-5 text-[#B8E62D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {isProjectDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#0E0E0E] border border-[#B8E62D]/20 rounded-xl shadow-2xl z-50"
                      >
                        <div 
                          className="max-h-60 overflow-y-auto custom-scrollbar"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(184, 230, 45, 0.3) transparent',
                          }}
                          onScroll={(e) => e.stopPropagation()}
                          onWheel={(e) => {
                            e.stopPropagation();
                            const container = e.currentTarget;
                            container.scrollTop += e.deltaY;
                          }}
                        >
                          <div className="p-2">
                            {projectTypes.map((type, index) => (
                              <motion.div
                                key={type}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={`p-3 rounded-lg cursor-pointer transition-all text-lg ${
                                  watch('projectType') === type
                                    ? 'bg-[#B8E62D]/20 text-[#B8E62D] border border-[#B8E62D]/30'
                                    : 'text-white hover:bg-white/5 hover:text-[#B8E62D]'
                                }`}
                                onClick={() => handleProjectTypeSelect(type)}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {type}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hidden input for form validation */}
                  <input
                    {...register('projectType')}
                    type="hidden"
                    value={watch('projectType') || ''}
                  />
                </div>
                {clientErrors.projectType && (
                  <FormFieldError message={clientErrors.projectType.message} />
                )}
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-3-recruiter"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">What's your email address?</h2>
              <p className="text-soft-white/70 mb-10">I'll use this to contact you about the position.</p>
              
              <div className="space-y-2">
                <input
                  {...register('email')}
                  type="email"
                  className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-xl placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all"
                  placeholder="Your email address"
                  autoFocus
                />
                {recruiterErrors.email && (
                  <FormFieldError message={recruiterErrors.email.message} />
                )}
              </div>
            </motion.div>
          );
        }
        
      case 4:
        if (userType === 'client') {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-4-client"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">What's your budget range?</h2>
              <p className="text-soft-white/70 mb-10">This helps me understand the project scope.</p>
              
              <div className="space-y-2">
                <input
                  {...register('budget')}
                  type="text"
                  className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-xl placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all"
                  placeholder="e.g. $5,000 - $10,000 (optional)"
                  autoFocus
                  onChange={handleBudgetChange}
                  value={watch('budget') || ''}
                />
                {clientErrors.budget && (
                  <FormFieldError message={clientErrors.budget.message} />
                )}
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-4-recruiter"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Describe the job requirements</h2>
              <p className="text-soft-white/70 mb-10">What are the key responsibilities and requirements?</p>
              
              <div className="space-y-2">
                <textarea
                  {...register('jobDescription')}
                  rows={5}
                  className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-xl placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all resize-none"
                  placeholder="Please provide a brief job description"
                  autoFocus
                />
                {recruiterErrors.jobDescription && (
                  <FormFieldError message={recruiterErrors.jobDescription.message} />
                )}
              </div>
            </motion.div>
          );
        }
        
      case 5:
        if (userType === 'client') {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-5-client"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">What's your timeline?</h2>
              <p className="text-soft-white/70 mb-10">When are you looking to complete this project?</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-4">
                  <motion.button
                    type="button"
                    onClick={() => updateTimeline(timelineDays - 1)}
                    className="w-12 h-12 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-2xl hover:bg-[#B8E62D]/10 transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    −
                  </motion.button>
                  
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold text-[#B8E62D] mb-2">{timelineDays}</div>
                    <div className="text-soft-white/70">{timelineDays === 1 ? 'day' : 'days'}</div>
                  </div>
                  
                  <motion.button
                    type="button"
                    onClick={() => updateTimeline(timelineDays + 1)}
                    className="w-12 h-12 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-2xl hover:bg-[#B8E62D]/10 transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    +
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[7, 14, 30, 60].map((days) => (
                    <motion.button
                      key={days}
                      type="button"
                      onClick={() => updateTimeline(days)}
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        timelineDays === days
                          ? 'border-[#B8E62D] bg-[#B8E62D]/10 text-[#B8E62D]'
                          : 'border-white/10 text-soft-white/70 hover:border-[#B8E62D]/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {days}d
                    </motion.button>
                  ))}
                </div>
                
                <input
                  {...register('timeline')}
                  type="hidden"
                  value={`${timelineDays} days`}
                />
                
                {clientErrors.timeline && (
                  <FormFieldError message={clientErrors.timeline.message} />
                )}
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-5-recruiter"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">What type of employment?</h2>
              <p className="text-soft-white/70 mb-10">Select the employment type for this position.</p>
              
              <div className="space-y-4">
                {['Full-time', 'Part-time', 'Contract', 'Freelance'].map((type) => (
                  <motion.div
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border ${
                      watch('employmentType') === type
                        ? 'border-[#B8E62D] bg-[#B8E62D]/10'
                        : 'border-white/10 hover:border-[#B8E62D]/50'
                    } transition-all cursor-pointer`}
                    onClick={() => setValue('employmentType', type, { shouldValidate: true })}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        watch('employmentType') === type
                          ? 'bg-[#B8E62D]'
                          : 'bg-white/10'
                      }`}>
                        {watch('employmentType') === type && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                      <span className="text-white text-lg">{type}</span>
                    </div>
                  </motion.div>
                ))}
                
                {recruiterErrors.employmentType && (
                  <FormFieldError message={recruiterErrors.employmentType.message} />
                )}
              </div>
            </motion.div>
          );
        }

      case 6:
        if (userType === 'client') {
          return (
            <motion.div 
              className="max-w-xl w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-6-client"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Any additional details?</h2>
              <p className="text-soft-white/70 mb-10">Share any other information you'd like me to know.</p>
              
              <div className="space-y-2">
                <textarea
                  {...register('message')}
                  rows={6}
                  className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-xl placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all resize-none"
                  placeholder="Your message..."
                  autoFocus
                />
                {clientErrors.message && (
                  <FormFieldError message={clientErrors.message.message} />
                )}
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div 
              className="max-w-lg w-full mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              key="step-6-recruiter"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Where is the job located?</h2>
              <p className="text-soft-white/70 mb-10">Specify the work location arrangement.</p>
              
              <div className="space-y-4">
                {['Remote', 'On-site', 'Hybrid'].map((type) => (
                  <motion.div
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border ${
                      watch('workLocation') === type
                        ? 'border-[#B8E62D] bg-[#B8E62D]/10'
                        : 'border-white/10 hover:border-[#B8E62D]/50'
                    } transition-all cursor-pointer`}
                    onClick={() => setValue('workLocation', type, { shouldValidate: true })}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        watch('workLocation') === type
                          ? 'bg-[#B8E62D]'
                          : 'bg-white/10'
                      }`}>
                        {watch('workLocation') === type && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                      <span className="text-white text-lg">{type}</span>
                    </div>
                  </motion.div>
                ))}
                
                {['On-site', 'Hybrid'].includes(watch('workLocation')) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4"
                    >
                      <input
                        {...register('locationDetails')}
                        type="text"
                        placeholder="Enter location (city, country)"
                        className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-lg placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all"
                      />
                    </motion.div>
                  )}
                
                {recruiterErrors.workLocation && (
                  <FormFieldError message={recruiterErrors.workLocation.message} />
                )}
              </div>
            </motion.div>
          );
        }
        
      case 7:
        return (
          <motion.div 
            className="max-w-lg w-full mx-auto"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            key="step-7-recruiter"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">How should we schedule an interview?</h2>
            <p className="text-soft-white/70 mb-10">Let me know your availability for an interview.</p>
            
            <div className="space-y-2">
              <textarea
                {...register('interview')}
                rows={4}
                className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-xl placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all resize-none"
                placeholder="Provide interview availability or preferred method to schedule"
                autoFocus
              />
              {recruiterErrors.interview && (
                <FormFieldError message={recruiterErrors.interview.message} />
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-3">Additional notes or message</h3>
              <textarea
                {...register('message')}
                rows={4}
                className="w-full p-4 bg-white/5 border border-[#B8E62D]/10 rounded-xl text-white text-lg placeholder-soft-white/50 focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/30 focus:border-transparent transition-all resize-none"
                placeholder="Any additional information you'd like to share..."
              />
              {recruiterErrors.message && (
                <FormFieldError message={recruiterErrors.message.message} />
              )}
              
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Form container */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-6xl px-4 py-10">
          {/* Progress bar */}
          {userType && (
            <div className="mb-10 max-w-xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-soft-white/70 text-sm">
                  Step {step} of {getTotalSteps() - 1}
                </span>
                {step > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setStep(0)}
                    className="text-soft-white/70 text-sm hover:text-[#B8E62D] transition-colors"
                  >
                    Start over
                  </button>
                )}
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#B8E62D]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / (getTotalSteps() - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Form content */}
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation buttons */}
          {step > 0 && (
            <div className="flex justify-between mt-12 max-w-lg mx-auto">
              <motion.button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 border border-[#B8E62D]/20 rounded-lg text-white hover:bg-[#B8E62D]/10 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              
              {step < getTotalSteps() - 1 ? (
                <motion.button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-[#B8E62D]/10 border border-[#B8E62D]/20 rounded-lg text-white hover:bg-[#B8E62D]/20 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#B8E62D]/10 border border-[#B8E62D]/20 rounded-lg text-white hover:bg-[#B8E62D]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Sending...' : 'Submit'}
                </motion.button>
              )}
            </div>
          )}
        </form>
        
        {/* Success message */}
        <AnimatePresence>
          {submitStatus && (
            <motion.div
              className={`fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/80 backdrop-blur-sm`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className={`p-8 rounded-2xl max-w-md w-full ${
                  submitStatus.type === 'success' 
                    ? 'bg-[#0E0E0E] border border-[#B8E62D]/20' 
                    : 'bg-[#0E0E0E] border border-red-500/20'
                }`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="text-center">
                  {submitStatus.type === 'success' ? (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#B8E62D]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#B8E62D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {submitStatus.type === 'success' ? 'Message Sent!' : 'Error'}
                  </h3>
                  <p className={`mb-6 ${submitStatus.type === 'success' ? 'text-soft-white/70' : 'text-red-400'}`}>
                    {submitStatus.message}
                  </p>
                  
                  <button
                    onClick={() => setSubmitStatus(null)}
                    className="px-6 py-3 bg-[#B8E62D]/10 border border-[#B8E62D]/20 rounded-lg text-white hover:bg-[#B8E62D]/20 transition-colors w-full"
                  >
                    {submitStatus.type === 'success' ? 'Done' : 'Try Again'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}