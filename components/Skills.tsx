import React from 'react';
import SkillIcon, { type Piece } from './SkillIcon';
import SkillCloud from './SkillCloud';
import SkillTitle from './SkillTitle';

interface Group {
  piece: Piece;
  san: string;
  role: string;
  line: string;
  skills: string[];
}

/** The skill set, grouped by the piece each part of the stack plays. */
const GROUPS: Group[] = [
  {
    piece: 'queen',
    san: 'Q',
    role: 'Frontend',
    line: 'The piece with the most reach. This is where people meet the work.',
    skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Vue.js', 'HTML5', 'CSS', 'Tailwind CSS', 'Bootstrap'],
  },
  {
    piece: 'rook',
    san: 'R',
    role: 'Backend',
    line: 'Straight lines and heavy lifting: services, data and APIs.',
    skills: ['Java', 'Spring Boot', 'Node.js', 'Python', 'Django', 'C#', 'C++', 'PHP', 'REST APIs', 'Microservices', 'MySQL', 'PostgreSQL', 'Firebase'],
  },
  {
    piece: 'knight',
    san: 'N',
    role: 'AI and ML',
    line: 'The only piece that jumps. Useful when the direct route is blocked.',
    skills: ['LangChain', 'Hugging Face', 'ChromaDB', 'Google Gemini', 'Stable Diffusion', 'Computer Vision', 'MCP'],
  },
  {
    piece: 'bishop',
    san: 'B',
    role: 'Cloud and DevOps',
    line: 'Long diagonals. Getting the work from my machine to everyone else.',
    skills: ['AWS', 'Microsoft Azure', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'GitHub', 'GitLab', 'Linux'],
  },
  {
    piece: 'pawn',
    san: 'P',
    role: 'Everyday tools',
    line: 'Small moves that hold the structure together.',
    skills: ['Git', 'VS Code', 'WordPress', 'Shopify', 'SharePoint'],
  },
];

const Skills = () => (
  <section className="ae-section lg-wrap" aria-label="Skills">
    <SkillTitle />
    <ol className="ae-pieces" data-sc-in data-sc-stagger="60">
      {GROUPS.map((g) => (
        <li key={g.role} className="ae-piece">
          <div className="ae-piece__sq" aria-hidden="true">
            <SkillIcon piece={g.piece} />
            <span className="lg-note">{g.san}</span>
          </div>
          <div className="ae-piece__role">
            <h3 className="lg-display lg-display--sm">{g.role}</h3>
            <p>{g.line}</p>
          </div>
          <SkillCloud label={`${g.role} skills`} skills={g.skills} />
        </li>
      ))}
    </ol>
  </section>
);

export default Skills;
