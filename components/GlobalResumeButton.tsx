'use client'

import { useRouter } from 'next/navigation';
import ResumeRequestButton from './ResumeRequestButton';

const GlobalResumeButton = () => {
  const router = useRouter();

  const handleResumeClick = () => {
    router.push('/contact');
  };

  return <ResumeRequestButton onClick={handleResumeClick} />;
};

export default GlobalResumeButton; 