import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Experience, { type Role } from '../../../components/Experience';
import CompanyMarquee from '../../../components/CompanyMarquee';
import Education from '../../../components/about/Education';
import '../../about-experience.css';

export const metadata: Metadata = {
  title: 'Experience',
  description:
    'Where Nizar Kadri has worked as a software engineer and cloud administrator in Toronto, what changed there, and what it was built with.',
};

function getRoles(): Role[] {
  const dir = path.join(process.cwd(), 'data', 'experience');
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      return {
        ...(data as Role),
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
      };
    });
}

const ExperiencePage = async () => {
  const roles = getRoles();

  return (
    <div className="ae lg-page">
      <section className="ae-xhero lg-wrap" aria-labelledby="ae-experience-title">
        <h1 id="ae-experience-title" className="lg-display lg-display--xl">The moves already played.</h1>
        <p className="lg-body lg-body--lg">
          Where I have worked, what changed while I was there, and by how much. Every figure comes from the work itself.
        </p>
        <CompanyMarquee roles={roles} />
      </section>

      {roles.map((role) => (
        <Experience key={role.company} role={role} />
      ))}

      <section className="ae-section ae-section--last lg-wrap ae-xstudies" aria-labelledby="ae-xstudies-title">
        <h2 id="ae-xstudies-title" className="lg-display lg-display--lg" data-sc-in>Before the first move.</h2>
        <Education />
        <Link href="/about#certificates" className="lg-link">The certificates</Link>
      </section>
    </div>
  );
};

export default ExperiencePage;
