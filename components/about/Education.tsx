import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface Degree {
  institution?: string;
  degree: string;
}

function getDegrees(): Degree[] {
  const file = path.join(process.cwd(), 'data', 'education', 'degrees.md');
  if (!fs.existsSync(file)) return [];
  const { data } = matter(fs.readFileSync(file, 'utf8'));
  return Array.isArray(data.degrees) ? (data.degrees as Degree[]) : [];
}

/** Degrees as a two-line ledger, read from data/education/degrees.md. */
const Education = () => (
  <dl className="ae-studies" data-sc-in data-sc-stagger="60">
    {getDegrees().map((d) => {
      const m = d.degree.match(/^(.*?)\s*\((.*)\)\s*$/);
      const name = m ? m[1] : d.degree;
      const note = m ? m[2] : '';
      // An institution already named in the note is not repeated.
      const institution = d.institution && !note.toLowerCase().includes(d.institution.toLowerCase()) ? d.institution : '';
      return (
        <div key={d.degree}>
          <dt>{name}</dt>
          {institution && <dd className="lg-note">{institution}</dd>}
          {note && <dd>{note}</dd>}
        </div>
      );
    })}
  </dl>
);

export default Education;
