import React from 'react';

/** The skills one piece covers, as a plain list of chips. */
const SkillCloud = ({ label, skills }: { label: string; skills: string[] }) => (
  <ul className="ae-piece__skills" aria-label={label}>
    {skills.map((s) => (
      <li key={s} className="lg-chip">{s}</li>
    ))}
  </ul>
);

export default SkillCloud;
