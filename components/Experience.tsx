import React from 'react';

export interface Role {
  title: string;
  company: string;
  position: string;
  location: string;
  description?: string;
  achievements: string[];
  technologies: string[];
}

export const roleId = (role: Role) =>
  role.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Every percentage in a line, in the order it is written. */
const figures = (line: string) => Array.from(line.matchAll(/(\d+)%/g), (m) => m[1]);

/** The line itself, with its percentages set in ink. */
const emphasised = (line: string) =>
  line.split(/(\d+%)/g).map((part, i) => (/^\d+%$/.test(part) ? <strong key={i}>{part}</strong> : part));

/** One role as a ledger: who and where, what changed and by how much, what it was built with. */
const Experience = ({ role }: { role: Role }) => {
  const id = roleId(role);
  return (
    <article id={id} className="ae-role lg-wrap" aria-labelledby={`${id}-title`}>
      <header className="ae-role__head" data-sc-in>
        <h2 id={`${id}-title`} className="lg-display lg-display--lg">{role.company}</h2>
        <p className="ae-role__meta">
          <strong>{role.position}</strong>
          <span className="lg-note">{role.location}</span>
        </p>
      </header>

      <ul className="ae-entries">
        {role.achievements.map((line) => {
          const nums = figures(line);
          return (
            <li key={line} data-sc-in>
              <p className="ae-entry__figs" aria-hidden="true">
                {nums.map((n, i) => (
                  <span key={`${n}-${i}`}>
                    <b data-sc-count={`0 ${n}`}>{n}</b>
                    <i>%</i>
                  </span>
                ))}
              </p>
              <p className="ae-entry__text">{emphasised(line.replace(/\.\s*$/, ''))}.</p>
            </li>
          );
        })}
      </ul>

      <div className="ae-role__stack" data-sc-in>
        <p className="lg-note">Built with</p>
        <ul aria-label={`Technologies used at ${role.company}`}>
          {role.technologies.map((t) => (
            <li key={t} className="lg-chip">{t}</li>
          ))}
        </ul>
      </div>
    </article>
  );
};

export default Experience;
