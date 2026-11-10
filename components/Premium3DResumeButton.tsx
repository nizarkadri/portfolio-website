'use client';

import ResumeRequestButton from './ResumeRequestButton';

interface Premium3DResumeButtonProps {
  onClick: () => void;
}

/** Kept for its callers. The 3D treatment is gone; it is the same calm button as everywhere else. */
const Premium3DResumeButton = ({ onClick }: Premium3DResumeButtonProps) => <ResumeRequestButton onClick={onClick} />;

export default Premium3DResumeButton;
