import type { CSSProperties } from 'react';
import { stableHash } from '../lib/hash';

const TINTS = ['bg-tag-pink', 'bg-tag-blue', 'bg-tag-mint', 'bg-tag-lilac', 'bg-tag-peach', 'bg-tag-yellow'] as const;
const TILTS = [-3, -2, -1, 1, 2, 3] as const;

/** Deterministic tint and tilt from the student id (pastel name tags, slight random-looking rotation). */
export function tagLook(id: string): { tint: (typeof TINTS)[number]; tilt: number } {
  const h = stableHash(id);
  return { tint: TINTS[h % TINTS.length] ?? 'bg-tag-yellow', tilt: TILTS[(h >>> 8) % TILTS.length] ?? 0 };
}

type NameTagProps = { id: string; name: string; as?: 'li' | 'span'; animate?: boolean; delayMs?: number };

export function NameTag({ id, name, as: Tag = 'span', animate = false, delayMs = 0 }: NameTagProps) {
  const { tint, tilt } = tagLook(id);
  const style: CSSProperties = { rotate: `${tilt}deg`, animationDelay: animate ? `${delayMs}ms` : undefined };
  return (
    <Tag className={`inline-flex min-h-tap items-center rounded-lg px-3 text-base font-bold text-ink shadow-note ${tint} ${animate ? 'animate-tag-drop' : ''}`} style={style}>
      {name}
    </Tag>
  );
}
