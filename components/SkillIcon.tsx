import React from 'react';

export type Piece = 'queen' | 'rook' | 'knight' | 'bishop' | 'pawn';

const BASE = 'M6.2 20.1h11.6l.9 2.4H5.3l.9-2.4z';

const BODY: Record<Piece, string> = {
  queen:
    'M4.6 6.4a1.4 1.4 0 1 1 2.2 1.1l2.1 4.6 2-6.2a1.5 1.5 0 1 1 2.2 0l2 6.2 2.1-4.6a1.4 1.4 0 1 1 1.3.4L16.9 18.6H7.1L5.5 7.9a1.4 1.4 0 0 1-.9-1.5z',
  rook: 'M6.8 2.8h2.3v2h1.7v-2h2.4v2h1.7v-2h2.3v4.7l-1.7 1.6v6l1.8 3.5H6.7l1.8-3.5v-6L6.8 7.5V2.8z',
  knight:
    'M7.6 18.6c.1-3.2 2.1-4.9 3.4-7-1.2.6-2.3 1.4-3.5 1.7-.9.7-2 .5-2.5-.3-.4-.8-.1-1.7.6-2.3l3.4-4.1-.4-3.4 2.7 1.8c4.2.3 6.9 3.7 6.9 8.6v5H7.6z',
  bishop:
    'M12 1.6a1.5 1.5 0 0 1 1.1 2.5c2 1.5 3.2 3.6 3.2 5.7 0 1.6-.8 3-2 3.9l1.6 4.9H8.1l1.6-4.9c-1.2-.9-2-2.3-2-3.9 0-2.1 1.2-4.2 3.2-5.7A1.5 1.5 0 0 1 12 1.6z',
  pawn: 'M12 3.4a3 3 0 0 1 1.9 5.3c1.4.9 2.3 2.4 2.3 4 0 1.2-.5 2.3-1.3 3.1l1.2 2.8H7.9l1.2-2.8a4.4 4.4 0 0 1-1.3-3.1c0-1.6.9-3.1 2.3-4A3 3 0 0 1 12 3.4z',
};

/** Chess pieces drawn to sit beside the king mark in the bar. Decorative. */
const SkillIcon = ({ piece, className = '' }: { piece: Piece; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d={BODY[piece]} />
    <path d={BASE} />
  </svg>
);

export default SkillIcon;
