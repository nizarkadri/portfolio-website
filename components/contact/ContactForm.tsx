'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../../lib/schemas/contact';
import { Arrow } from '../Navbar';
import { ChoiceField, Field } from './Field';
import { REPLY } from './Scoresheet';

// ----------------------------------------------------------------------------
// Types and constants
// ----------------------------------------------------------------------------

/** The three kinds of message the contact API accepts. */
type UserType = 'client' | 'recruiter' | 'resume_request';

/**
 * Every field any mode can hold. The zod schema is a discriminated union on
 * `userType`: it validates only the active mode's fields and strips the rest,
 * so what is posted is exactly the shape the API expects.
 */
interface FormValues {
  userType: UserType;
  email: string;
  name: string;
  projectType: string;
  budget: string;
  timeline: string;
  company: string;
  position: string;
  jobDescription: string;
  employmentType: string;
  workLocation: string;
  locationDetails: string;
  interview: string;
  message: string;
}

const DEFAULT_DAYS = 30;
const timelineOf = (days: number) => `${days} ${days === 1 ? 'day' : 'days'}`;

const DEFAULTS: FormValues = {
  userType: 'client', email: '', name: '', projectType: '', budget: '', timeline: timelineOf(DEFAULT_DAYS),
  company: '', position: '', jobDescription: '', employmentType: '', workLocation: '', locationDetails: '', interview: '', message: '',
};

const MODES: ReadonlyArray<{ value: UserType; title: string; sub: string; intro: string }> = [
  { value: 'client', title: 'A project', sub: 'You have something to build', intro: 'Tell me what you want built. A rough idea is enough to start.' },
  { value: 'recruiter', title: 'A role', sub: 'You are hiring', intro: 'Tell me about the role and how you would like to talk.' },
  { value: 'resume_request', title: 'My resume', sub: 'You want the full record', intro: 'Tell me which role you have in mind and where to send it.' },
];

/** `?type=` presets, so a link elsewhere on the site can open the right mode. */
const PRESETS: Record<string, UserType> = {
  client: 'client', project: 'client',
  recruiter: 'recruiter', role: 'recruiter', hiring: 'recruiter',
  resume: 'resume_request', resume_request: 'resume_request', cv: 'resume_request',
};

const PROJECT_TYPES: readonly string[] = [
  'Website', 'Web Application', 'Mobile App (iOS)', 'Mobile App (Android)', 'Mobile App (Cross-platform)',
  'E-commerce Platform', 'Portfolio Website', 'Landing Page', 'Dashboard/Admin Panel', 'API Development',
  'Database Design', 'UI/UX Design', 'WordPress Site', 'Custom Software', 'SaaS Platform',
  'Progressive Web App (PWA)', 'Chrome Extension', 'Desktop Application', 'Game Development',
  'Blockchain/Web3 Project', 'AI/ML Integration', 'Data Visualization', 'CRM System',
  'Booking/Reservation System', 'Educational Platform', 'Social Media Platform', 'Other',
];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance'] as const;
const WORK_LOCATIONS = ['Remote', 'On-site', 'Hybrid'] as const;
const DAY_PRESETS = [7, 14, 30, 60] as const;

const clampDays = (n: number) => Math.max(1, Math.min(365, Math.round(n)));
/** Budget accepts digits, commas and hyphens only, as it always has. */
const formatBudget = (value: string) => value.replace(/[^0-9,-]/g, '');

const FALLBACK_ERROR = 'The message could not be sent. Check your connection and try again.';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default function ContactForm({ onSent }: { onSent: () => void }) {
  const {
    register, handleSubmit, reset, watch, setValue, clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // SAFETY: the schema's output is one member of the union; FormValues is the flat superset of those members.
    resolver: zodResolver(contactSchema) as unknown as Resolver<FormValues>,
    mode: 'onTouched',
    defaultValues: DEFAULTS,
  });

  const mode = watch('userType');
  const workLocation = watch('workLocation');
  const timeline = watch('timeline');
  const [daysText, setDaysText] = useState(String(DEFAULT_DAYS));
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  // Open the mode a link asked for. Client only, so the server markup never differs.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('type');
    const preset = wanted ? PRESETS[wanted.toLowerCase()] : undefined;
    if (preset) setValue('userType', preset);
  }, [setValue]);

  // A remote role has no office, so a city typed earlier is not sent along with it.
  useEffect(() => { if (workLocation === 'Remote') setValue('locationDetails', ''); }, [workLocation, setValue]);
  useEffect(() => { if (failure) alertRef.current?.focus(); }, [failure]);
  useEffect(() => { if (done) doneRef.current?.focus(); }, [done]);

  const days = clampDays(parseInt(daysText, 10) || DEFAULT_DAYS);
  const setDays = (n: number) => {
    const next = clampDays(n);
    setDaysText(String(next));
    setValue('timeline', timelineOf(next), { shouldDirty: true });
  };
  const onDaysTyped = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDaysText(e.target.value);
    const n = parseInt(e.target.value, 10);
    if (!Number.isNaN(n)) setValue('timeline', timelineOf(clampDays(n)), { shouldDirty: true });
  };

  const onSubmit = async (values: FormValues) => {
    setFailure(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      let result: { message?: string } | null = null;
      try { result = await response.json(); } catch { /* a non-JSON reply is handled by the status below */ }
      if (!response.ok) {
        setFailure(result?.message || 'Failed to send message');
        return;
      }
      // Success is only ever shown after the API has answered 2xx.
      const kept = values.userType;
      reset({ ...DEFAULTS, userType: kept });
      setDaysText(String(DEFAULT_DAYS));
      setDone(true);
      onSent();
    } catch {
      setFailure(FALLBACK_ERROR);
    }
  };

  if (done) {
    return (
      <section className="ct-done bc-rise" aria-labelledby="ct-done-title">
        <p className="lg-note"><b>1... {REPLY}</b></p>
        <h2 id="ct-done-title" ref={doneRef} tabIndex={-1} className="lg-display lg-display--lg">Move played.</h2>
        <p className="lg-body lg-body--lg">Your message is with me. I usually reply within a day.</p>
        <div className="ct-done__actions">
          <button type="button" className="bc-btn" onClick={() => setDone(false)}>Send another message</button>
          <Link href="/projects" className="lg-link">See the work</Link>
        </div>
      </section>
    );
  }

  const active = MODES.find((m) => m.value === mode) ?? MODES[0];
  const modeField = register('userType', { onChange: () => { clearErrors(); setFailure(null); } });
  const budgetField = register('budget', {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue('budget', formatBudget(e.target.value), { shouldValidate: true }),
  });

  const emailField = (label: string) => (
    <Field id="ct-email" label={label} error={errors.email?.message}>
      {(c) => <input {...register('email')} {...c} className="fx-input" type="email" inputMode="email" autoComplete="email" placeholder="you@company.com" />}
    </Field>
  );

  return (
    <form className="ct-form" method="post" noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Your reply">
      <noscript>
        <p className="ct-noscript">This form needs JavaScript to send. Until it is on, LinkedIn and GitHub both reach me.</p>
      </noscript>

      <fieldset className="ct-seg">
        <legend className="fx-label">What is this about?</legend>
        <div className="ct-seg__opts">
          {MODES.map((m) => (
            <label key={m.value} className="ct-seg__opt">
              <input type="radio" value={m.value} {...modeField} />
              <span>
                <strong>{m.title}</strong>
                <small>{m.sub}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="ct-form__fields" key={mode}>
        <p className="ct-form__intro">{active.intro}</p>

        {mode === 'client' && (
          <>
            <div className="fx-pair">
              <Field id="ct-name" label="Your name" error={errors.name?.message}>
                {(c) => <input {...register('name')} {...c} className="fx-input" type="text" autoComplete="name" />}
              </Field>
              {emailField('Email')}
            </div>
            <Field id="ct-project-type" label="Kind of project" error={errors.projectType?.message}>
              {(c) => (
                <div className="fx-select">
                  <select {...register('projectType')} {...c} className="fx-input">
                    <option value="">Choose a category</option>
                    {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </Field>
            <div className="fx-pair">
              <Field id="ct-budget" label="Budget" optional hint="Digits, commas and a hyphen for a range. A ballpark is fine." error={errors.budget?.message}>
                {(c) => <input {...budgetField} {...c} className="fx-input" type="text" inputMode="text" autoComplete="off" placeholder="5,000-10,000" />}
              </Field>
              <div className="fx-field" role="group" aria-labelledby="ct-days-label">
                <label id="ct-days-label" className="fx-label" htmlFor="ct-days">Timeline, in days</label>
                <div className="ct-days">
                  <div className="ct-days__step">
                    <button type="button" onClick={() => setDays(days - 1)} disabled={days <= 1} aria-label="One day less">-</button>
                    <input id="ct-days" className="fx-input" type="number" inputMode="numeric" min={1} max={365} step={1}
                      value={daysText} onChange={onDaysTyped} onBlur={() => setDays(days)} aria-describedby="ct-days-hint" />
                    <button type="button" onClick={() => setDays(days + 1)} disabled={days >= 365} aria-label="One day more">+</button>
                  </div>
                </div>
                <div className="fx-choices" role="group" aria-label="Common timelines">
                  {DAY_PRESETS.map((d) => (
                    <button key={d} type="button" className="bc-pill" aria-pressed={days === d} aria-label={`${d} days`} onClick={() => setDays(d)}>{d}</button>
                  ))}
                </div>
                <p id="ct-days-hint" className="fx-hint">Sent as: {timeline}. Between 1 and 365.</p>
              </div>
            </div>
            <Field id="ct-message" label="Tell me about it" hint="Features, references, constraints, links. Whatever helps." error={errors.message?.message}>
              {(c) => <textarea {...register('message')} {...c} className="fx-input" rows={6} />}
            </Field>
          </>
        )}

        {mode === 'recruiter' && (
          <>
            <div className="fx-pair">
              <Field id="ct-company" label="Company" error={errors.company?.message}>
                {(c) => <input {...register('company')} {...c} className="fx-input" type="text" autoComplete="organization" />}
              </Field>
              <Field id="ct-position" label="Role you are filling" error={errors.position?.message}>
                {(c) => <input {...register('position')} {...c} className="fx-input" type="text" autoComplete="off" placeholder="Senior Full Stack Developer" />}
              </Field>
            </div>
            {emailField('Work email')}
            <Field id="ct-job" label="About the role" hint="Responsibilities and the skills that matter most." error={errors.jobDescription?.message}>
              {(c) => <textarea {...register('jobDescription')} {...c} className="fx-input" rows={5} />}
            </Field>
            <ChoiceField id="ct-employment" label="Employment type" error={errors.employmentType?.message}>
              {EMPLOYMENT_TYPES.map((t) => (
                <label key={t} className="fx-choice"><input type="radio" value={t} {...register('employmentType')} /><span>{t}</span></label>
              ))}
            </ChoiceField>
            <ChoiceField id="ct-location" label="Where the role is based" error={errors.workLocation?.message}>
              {WORK_LOCATIONS.map((t) => (
                <label key={t} className="fx-choice"><input type="radio" value={t} {...register('workLocation')} /><span>{t}</span></label>
              ))}
            </ChoiceField>
            {(workLocation === 'On-site' || workLocation === 'Hybrid') && (
              <Field id="ct-location-details" label="City or office" optional error={errors.locationDetails?.message}>
                {(c) => <input {...register('locationDetails')} {...c} className="fx-input" type="text" autoComplete="off" placeholder="Toronto, ON" />}
              </Field>
            )}
            <Field id="ct-interview" label="How should we set up a conversation?" hint="A scheduling link, or the times that suit you." error={errors.interview?.message}>
              {(c) => <textarea {...register('interview')} {...c} className="fx-input fx-input--short" rows={3} />}
            </Field>
            <Field id="ct-message" label="Anything else" optional error={errors.message?.message}>
              {(c) => <textarea {...register('message')} {...c} className="fx-input fx-input--short" rows={3} />}
            </Field>
          </>
        )}

        {mode === 'resume_request' && (
          <>
            {emailField('Email to send it to')}
            <Field id="ct-job" label="The role you have in mind" hint="A short description, or paste the posting." error={errors.jobDescription?.message}>
              {(c) => <textarea {...register('jobDescription')} {...c} className="fx-input" rows={5} />}
            </Field>
            <Field id="ct-message" label="A note" optional error={errors.message?.message}>
              {(c) => <textarea {...register('message')} {...c} className="fx-input fx-input--short" rows={3} />}
            </Field>
          </>
        )}
      </div>

      {failure && (
        <div ref={alertRef} tabIndex={-1} role="alert" className="ct-alert">
          <strong>Not sent.</strong>
          <span>{failure} Your answers are still here.</span>
        </div>
      )}

      <div className="ct-submit">
        <button type="submit" className="lg-cta" disabled={isSubmitting} aria-busy={isSubmitting} data-sc-magnet="0.2">
          {isSubmitting ? <><span className="ct-spin" aria-hidden="true" /> Sending your move</> : <>Send your move <Arrow /></>}
        </button>
        <p>I usually reply within a day.</p>
      </div>
    </form>
  );
}
