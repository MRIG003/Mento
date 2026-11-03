import type { ReactNode } from 'react';

/**
 * A highlighter swipe behind text: the heatmap metaphor. Uses <mark> so assistive tech knows it is highlighted.
 * The swipe draws once (reduced motion: shown at once, via the global reduced-motion rule).
 */
export function HighlighterMark({ children, animate = true }: { children: ReactNode; animate?: boolean }) {
  return (
    <mark className="relative isolate inline-block bg-transparent px-1 text-inherit">
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-[0.08em] top-[0.18em] -z-10 origin-left -rotate-1 rounded-[0.2em] bg-highlight ${animate ? 'animate-highlight' : ''}`}
      />
      {children}
    </mark>
  );
}
