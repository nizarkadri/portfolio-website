'use client';

import { usePathname, useRouter } from 'next/navigation';
import ResumeRequestButton from './ResumeRequestButton';

/**
 * No longer mounted in the layout. The resume request is a mode of the contact form;
 * if this is ever rendered again it opens that mode directly.
 */
const GlobalResumeButton = () => {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname?.startsWith('/contact')) return null;

  return <ResumeRequestButton onClick={() => router.push('/contact?type=resume')} />;
};

export default GlobalResumeButton;
