'use client'

import { usePathname, useRouter } from 'next/navigation';
import ResumeRequestButton from './ResumeRequestButton';

const GlobalResumeButton = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleResumeClick = () => {
    router.push('/contact');
  };

  if (pathname?.startsWith('/contact')) {
    return null;
  }

  return <ResumeRequestButton onClick={handleResumeClick} />;
};

export default GlobalResumeButton; 