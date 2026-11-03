import Link from 'next/link';
import type { ReactNode } from 'react';
import { BUTTON_SHARED, BUTTON_VARIANT, type ButtonVariant } from './Button';

type ButtonLinkProps = { href: string; variant?: ButtonVariant; icon?: ReactNode; children: ReactNode; className?: string };

/** Same look as Button, for navigation (keeps the right semantics: a link, not a button). */
export function ButtonLink({ href, variant = 'primary', icon, children, className = '' }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${BUTTON_SHARED} ${BUTTON_VARIANT[variant]} ${className}`}>
      {icon ? <span aria-hidden="true" className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </Link>
  );
}
