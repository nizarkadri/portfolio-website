'use client'

import { useState } from 'react';
import ResumeRequestButton from './ResumeRequestButton';
import ResumeRequestModal from './ResumeRequestModal';

const GlobalResumeButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ResumeRequestButton onClick={() => setIsModalOpen(true)} />
      <ResumeRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default GlobalResumeButton; 