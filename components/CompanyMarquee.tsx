import React from 'react';
import { Arrow } from './Navbar';
import { roleId, type Role } from './Experience';

/** The roster of roles at the top of the experience page. Each line jumps to its entry. */
const CompanyMarquee = ({ roles }: { roles: Role[] }) => (
  <nav aria-label="Roles" className="ae-roster">
    <ul>
      {roles.map((role) => (
        <li key={role.company}>
          <a href={`#${roleId(role)}`}>
            <strong>{role.company}</strong>
            <span className="lg-note">{role.position}</span>
            <Arrow />
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export default CompanyMarquee;
