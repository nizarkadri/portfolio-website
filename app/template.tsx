'use client';

import PageTransition from '../components/PageTransition';
import TransitionOverlay from '../components/TransitionOverlay';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TransitionOverlay />
      <PageTransition>
        {children}
      </PageTransition>
    </>
  );
} 