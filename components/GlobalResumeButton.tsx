'use client'

import { useState, createContext, useContext } from 'react';
import ResumeRequestButton from './ResumeRequestButton';
import ResumeRequestModal from './ResumeRequestModal';

// Create context for resume modal state
interface ResumeModalContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ResumeModalContext = createContext<ResumeModalContextType | null>(null);

// Hook to use the resume modal context
export const useResumeModal = () => {
  const context = useContext(ResumeModalContext);
  if (!context) {
    throw new Error('useResumeModal must be used within a ResumeModalProvider');
  }
  return context;
};

// Provider component
export const ResumeModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ResumeModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
      <ResumeRequestModal isOpen={isModalOpen} onClose={closeModal} />
    </ResumeModalContext.Provider>
  );
};

// The actual button component
const GlobalResumeButton = () => {
  const { openModal } = useResumeModal();

  return <ResumeRequestButton onClick={openModal} />;
};

export default GlobalResumeButton; 