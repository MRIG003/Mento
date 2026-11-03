'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useI18n } from '../i18n/provider';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';

export const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  // Primary: indigo pill, white text, 56 px high (Stationery Desk).
  primary: 'min-h-pill w-full rounded-full bg-primary px-6 text-lg font-extrabold text-card shadow-card hover:bg-primary-pressed',
  secondary: 'min-h-tap rounded-full border-2 border-ink/80 bg-card px-5 font-bold text-ink hover:bg-paper',
  quiet: 'min-h-tap rounded-full px-4 font-bold text-primary underline-offset-4 hover:underline',
};
export const BUTTON_SHARED = 'inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  /** Shows a working state: disabled, aria-busy, label kept for screen readers. */
  busy?: boolean;
};

export function Button({ variant = 'primary', icon, busy = false, disabled, children, className = '', type = 'button', ...rest }: ButtonProps) {
  const { t } = useI18n();
  return (
    <button type={type} disabled={disabled || busy} aria-busy={busy || undefined} className={`${BUTTON_SHARED} ${BUTTON_VARIANT[variant]} ${className}`} {...rest}>
      {icon ? <span aria-hidden="true" className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
      {busy ? <span className="sr-only">{t('common.working')}</span> : null}
    </button>
  );
}
