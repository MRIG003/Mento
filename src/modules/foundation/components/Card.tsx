import type { ReactNode } from 'react';

type CardProps = { title?: string; titleId?: string; as?: 'section' | 'div' | 'article'; className?: string; children: ReactNode };

/** White rounded card. The optional title is small caps and muted ("CONCEPTS"). */
export function Card({ title, titleId, as: Tag = 'section', className = '', children }: CardProps) {
  return (
    <Tag aria-labelledby={title && titleId ? titleId : undefined} className={`rounded-card bg-card p-4 shadow-card ${className}`}>
      {title ? (
        <h2 id={titleId} className="caps mb-3 text-xs font-extrabold text-ink-muted">{title}</h2>
      ) : null}
      {children}
    </Tag>
  );
}
