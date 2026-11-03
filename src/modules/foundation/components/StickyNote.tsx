import type { CSSProperties, ReactNode } from 'react';

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'mint' | 'lilac' | 'peach';

const BG: Record<NoteColor, string> = {
  yellow: 'bg-note', pink: 'bg-tag-pink', blue: 'bg-tag-blue', mint: 'bg-tag-mint', lilac: 'bg-tag-lilac', peach: 'bg-tag-peach',
};

/** A strip of pink washi tape across the top edge. Decorative only. */
export function WashiTape({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 rotate-[2deg] rounded-[2px] bg-washi/85 shadow-[0_1px_2px_rgb(0_0_0/0.08)] ${className}`}
      style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgb(255 255 255 / 0.28) 0 6px, transparent 6px 12px)' }}
    />
  );
}

type StickyNoteProps = {
  color?: NoteColor;
  /** Degrees of tilt; the headline note uses −1.5. */
  rotate?: number;
  tape?: boolean;
  as?: 'div' | 'section' | 'article' | 'li';
  className?: string;
  children: ReactNode;
};

export function StickyNote({ color = 'yellow', rotate = -1.5, tape = false, as: Tag = 'div', className = '', children }: StickyNoteProps) {
  const style: CSSProperties = { transform: `rotate(${rotate}deg)` };
  return (
    <Tag className={`relative rounded-[3px] px-5 py-5 text-ink shadow-note ${BG[color]} ${tape ? 'mt-3' : ''} ${className}`} style={style}>
      {tape ? <WashiTape /> : null}
      {children}
    </Tag>
  );
}
