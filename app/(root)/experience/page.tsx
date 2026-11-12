import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import type { Role } from '../../../components/Experience';
import Education from '../../../components/about/Education';
import CertDrift from '../../../components/about/CertDrift';
import Skills, { GROUPS } from '../../../components/Skills';
import ExperienceStage from '../../../components/experience/ExperienceStage';
import { resultsOf } from '../../../components/experience/results';
import { getCertificates } from '../../../components/about/certificates';
import { Rise } from '../../../components/story/Rise';
import '../../about-experience.css';
import '../../experience.css';

export const metadata: Metadata = {
  title: 'Experience',
  description:
    'Where Nizar Kadri has worked as a software engineer and cloud administrator in Toronto, what changed there, what he builds with, and his degrees and certificates.',
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

/** Experience: one world behind the page, a place in it for each part of the record. */
const ExperiencePage = async () => {
  const roles = getRoles();
  const results = resultsOf(roles);
  const certificates = getCertificates();

  const credentials = (
    <div className="xp-cred">
      <div className="lg-wrap xp-cred__head" data-sc-in>
        <h2 className="lg-display xp-cred__title"><Rise text="Where I studied, and since." /></h2>
        <Education />
        <p className="lg-body">{certificates.length} certificates, going by. Hover to hold a row; open any one to read it.</p>
      </div>
      <CertDrift certificates={certificates} />
    </div>
  );

  return (
    <div className="xp">
      <ExperienceStage
        results={results}
        roles={roles.map((r) => ({ company: r.company, position: r.position, location: r.location, technologies: r.technologies, achievements: r.achievements }))}
        groups={GROUPS}
        credentials={credentials}
        skills={<Skills />}
      />
    </div>
  );
};

export default ExperiencePage;
