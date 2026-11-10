'use client';

import { useCallback, useEffect, useState } from 'react';
import { Arrow } from '../Navbar';
import { SOCIALS } from '../NewFooter';
import ContactForm from './ContactForm';
import Scoresheet, { REPLY, type ReplyState } from './Scoresheet';

const REPLY_KEY = 'lg-reply';

/**
 * The destination of the site. White has played six moves; the form is Black's reply.
 * A visitor who pressed the last square on the landing page arrives with 1... e5 already
 * on the sheet. Sending the form stamps it as played.
 */
export default function ContactExperience() {
  // Starts as "waiting" on the server and on first paint; the stored reply is read after mount.
  const [reply, setReply] = useState<ReplyState>('waiting');

  useEffect(() => {
    try {
      if (sessionStorage.getItem(REPLY_KEY) === REPLY) setReply((r) => (r === 'sent' ? r : 'replied'));
    } catch { /* private mode: the column simply waits */ }
  }, []);

  const onSent = useCallback(() => {
    setReply('sent');
    try { sessionStorage.setItem(REPLY_KEY, REPLY); } catch { /* private mode */ }
  }, []);

  return (
    <div className="lg-page ct">
      <div className="lg-wrap ct-grid">
        <div className="ct-side">
          <div className="ct-lead">
            <p className="lg-note">Black to play</p>
            <h1 className="lg-display lg-display--xl">Your move.</h1>
            <p className="lg-body lg-body--lg">
              White has played six. The reply is yours: a project, a role, or a request for my resume.
            </p>
            <Scoresheet reply={reply} />
          </div>

          <section className="ct-channels" aria-labelledby="ct-channels-title">
            <h2 id="ct-channels-title">Or reach me directly</h2>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noreferrer noopener">
                    <strong>{s.name}</strong>
                    <span>{s.url.replace(/^https?:\/\//, '')}</span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="ct-main">
          <ContactForm onSent={onSent} />
        </div>
      </div>
    </div>
  );
}
