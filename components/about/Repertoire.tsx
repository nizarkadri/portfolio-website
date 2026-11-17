import React from 'react';
import { Rise } from '../story/Rise';

interface Tool {
  name: string;
  role: string;          // plainly what it is
  href: string;
  verdict: string;       // the one line to read if you read nothing else
  why: string;
  marks: string[];       // what I actually use it for
}

/** The software he opens every day, in his own words and his own order. */
const TOOLS: Tool[] = [
  {
    name: 'Brave',
    role: 'Browser',
    href: 'https://brave.com',
    verdict: 'The best minimal browser I have used.',
    why: 'I love its multiple profiles, and ads and trackers are blocked from the start. Memory handling is excellent: it never lags, however many hundreds of tabs are open. Tab groups keep each working session together, exactly where I left it, and a group that is not active uses nothing. The interface is extremely customizable, a VPN, Tor and a wallet are built in, and the few ads it shows are for products that can be useful, and it pays for them.',
    marks: ['Profiles', 'Tab groups', 'Ad and tracker blocking', 'VPN, Tor, wallet'],
  },
  {
    name: 'Pi',
    role: 'Agent harness',
    href: 'https://pi.dev',
    verdict: 'Incredibly fast and light, with no bloat.',
    why: 'Pi is the harness my coding agents run in. It is super customizable, and I like it so much that I have contributed to the open-source pi-crew repo.',
    marks: ['Fast', 'Customizable', 'Open-source contributor'],
  },
  {
    name: 'OpenRouter',
    role: 'Model gateway',
    href: 'https://openrouter.ai',
    verdict: 'The first thing I check when I wake up.',
    why: 'I look for new model releases every morning, and I am always on the lookout for new free models or discounts. It is super convenient, easy to connect, and the limits on free models are insanely generous.',
    marks: ['New releases', 'Free models', 'Discounts'],
  },
  {
    name: 'herdr',
    role: 'Session manager',
    href: 'https://herdr.dev',
    verdict: 'My whole team of agents, ready where I left it.',
    why: 'It manages several Pi sessions at once and keeps them active, along with the team of agents I created in them and the models I selected. The next time I work on the same thing, I start herdr, attach the session by name, and the entire team is ready to work.',
    marks: ['Many sessions', 'Attach by name', 'Agents and models kept'],
  },
  {
    name: 'Proton Mail',
    role: 'Private email',
    href: 'https://proton.me/mail',
    verdict: 'Perfect for privacy, and no trackers.',
    why: 'I use it on every new website I want to explore, AI gateways especially, where so many are fake or scams. It is not tied to any other ID and needs no phone number, so those sites cannot build a profile on me the way they do when you sign in with Google.',
    marks: ['No trackers', 'No phone number', 'New sign-ups'],
  },
  {
    name: 'BCUninstaller',
    role: 'Windows uninstaller',
    href: 'https://www.bcuninstaller.com',
    verdict: 'Uninstalls anything, and cleans up after it.',
    why: 'Clean, open-source software with no bloat. If you know, you know how bad the default Windows uninstaller is: it leaves so many traces and so much junk behind. BCUninstaller cleans them all.',
    marks: ['Open source', 'No leftovers', 'Windows'],
  },
];

const Out = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="rp__out">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * What he reaches for every day, set as six squares of one board: white marble and pale blue, edge to edge.
 * A repertoire is what a player opens with without stopping to think; that is the only chess in it. Each
 * square says plainly what the thing is, gives his one-line verdict, then his reasons, all on show at once.
 */
export default function Repertoire() {
  return (
    <section className="rp lg-wrap" aria-labelledby="rp-title">
      <header className="rp__head" data-sc-in>
        <div className="rp__lead">
          <p className="lg-note ab2-folio">Every day</p>
          <h2 id="rp-title" className="lg-display rp__title"><Rise text="My daily repertoire." /></h2>
        </div>
        <p className="rp__lede">
          A repertoire is what you open with, without stopping to think. Away from the board, these six are mine:
          the software I open every day, and why each one has stayed.
        </p>
      </header>

      <ul className="rp__board" data-sc-in data-sc-stagger="90">
        {TOOLS.map((t, i) => (
          <li key={t.name} className="rp__sq">
            <p className="lg-note rp__role"><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{t.role}</p>
            <h3 className="rp__name">
              <a href={t.href} target="_blank" rel="noreferrer noopener" aria-label={`${t.name} (opens in a new tab)`}>
                <span>{t.name}</span><Out />
              </a>
            </h3>
            <p className="rp__verdict">{t.verdict}</p>
            <p className="rp__why">{t.why}</p>
            <ul className="rp__marks" aria-label={`What I use ${t.name} for`}>
              {t.marks.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
