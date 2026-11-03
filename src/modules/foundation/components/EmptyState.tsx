import type { ReactNode } from 'react';

type EmptyStateProps = { title: string; body?: string; action?: ReactNode; illustration?: ReactNode };

/** Empty states name the next action ("Desk is clear. Start with a homework."). */
export function EmptyState({ title, body, action, illustration }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      {illustration ? <div aria-hidden="true" className="text-ink-muted">{illustration}</div> : null}
      <p className="text-lg font-extrabold">{title}</p>
      {body ? <p className="max-w-xs text-ink-muted">{body}</p> : null}
      {action ? <div className="mt-2 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
