'use client';

import { useId, type ReactNode } from 'react';
import { useI18n } from '../i18n/provider';

export type FieldControlProps = { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true; 'aria-required'?: true };

type FieldProps = {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: (control: FieldControlProps) => ReactNode;
};

/** Label + hint + error wired to the control with aria-describedby / aria-invalid (WCAG 1.3.1, 3.3.1). */
export function Field({ label, hint, error, required = false, children }: FieldProps) {
  const { t } = useI18n();
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const control: FieldControlProps = { id };
  if (describedBy) control['aria-describedby'] = describedBy;
  if (error) control['aria-invalid'] = true;
  if (required) control['aria-required'] = true;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-bold">
        {label}
        {required ? <span className="ml-1 text-sm font-normal text-ink-muted">{`(${t('field.required')})`}</span> : null}
      </label>
      {hint ? <p id={hintId} className="text-sm text-ink-muted">{hint}</p> : null}
      {children(control)}
      {error ? <p id={errorId} role="alert" className="text-sm font-bold text-bad">{error}</p> : null}
    </div>
  );
}

/** Shared look for text inputs inside a Field (≥ 44 px, visible border, large text). */
export const inputClass = 'min-h-tap w-full rounded-xl border-2 border-line bg-card px-3 py-2 text-lg text-ink placeholder:text-ink-muted focus:border-primary aria-[invalid=true]:border-bad';
