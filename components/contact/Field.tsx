import type { ReactNode } from 'react';
import FormFieldError from '../FormFieldError';

/** The attributes a control needs so its label, hint and error are announced with it. */
export interface ControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (control: ControlProps) => ReactNode;
}

/** A visible label, the control, an optional hint and the inline error, wired together. */
export function Field({ id, label, optional, hint, error, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="fx-field">
      <label className="fx-label" htmlFor={id}>
        {label}{optional && <span className="fx-opt"> (optional)</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && <p id={hintId} className="fx-hint">{hint}</p>}
      <FormFieldError id={errorId} message={error} />
    </div>
  );
}

interface ChoiceFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

/** A radio set with a legend. The error is tied to the group. */
export function ChoiceField({ id, label, error, children }: ChoiceFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <fieldset className="fx-field" role="radiogroup" aria-required="true" aria-invalid={Boolean(error)} aria-describedby={errorId}>
      <legend className="fx-label" style={{ marginBottom: '0.5rem' }}>{label}</legend>
      <div className="fx-choices">{children}</div>
      <FormFieldError id={errorId} message={error} />
    </fieldset>
  );
}
