/** Grown-up stationery stickers for the Starter Checklist (creative brief §5). Decorative SVGs. */
export type StickerKind = 'paperclip' | 'stamp' | 'rubber' | 'highlighter' | 'seal';

const common = { width: 40, height: 40, viewBox: '0 0 40 40', 'aria-hidden': true, focusable: false } as const;

export function Sticker({ kind, earned }: { kind: StickerKind; earned: boolean }) {
  const muted = earned ? '' : 'opacity-25 grayscale';
  switch (kind) {
    case 'paperclip':
      return <svg {...common} className={muted}><path d="M14 30V11a6 6 0 0 1 12 0v17a4 4 0 0 1-8 0V13" fill="none" stroke="#5A5A52" strokeWidth="2.5" strokeLinecap="round" /></svg>;
    case 'stamp':
      return <svg {...common} className={muted}><rect x="7" y="7" width="26" height="26" rx="2" fill="#BFE0F7" stroke="#2F3FBF" strokeWidth="2" strokeDasharray="3 2" /><path d="M13 25l5-6 4 4 5-8" fill="none" stroke="#2F3FBF" strokeWidth="2" /></svg>;
    case 'rubber':
      return <svg {...common} className={muted}><rect x="5" y="12" width="30" height="16" rx="3" fill="none" stroke="#C62828" strokeWidth="2.5" transform="rotate(-8 20 20)" /><path d="M12 20h16" stroke="#C62828" strokeWidth="2.5" transform="rotate(-8 20 20)" /></svg>;
    case 'highlighter':
      return <svg {...common} className={muted}><rect x="11" y="6" width="12" height="20" rx="2" fill="#FFEB3B" stroke="#B26A00" strokeWidth="1.5" transform="rotate(30 17 16)" /><path d="M6 33h20" stroke="#FFEB3B" strokeWidth="5" strokeLinecap="round" /></svg>;
    case 'seal':
      return <svg {...common} className={muted}><circle cx="20" cy="18" r="11" fill="#FFE58A" stroke="#B26A00" strokeWidth="2" /><path d="M20 11l2 4.5 5 .5-3.7 3.3 1 4.9L20 21.8l-4.3 2.4 1-4.9L13 16l5-.5z" fill="#B26A00" /><path d="M14 27l-2 8 4-2 2 3 2-8M26 27l2 8-4-2-2 3-2-8" fill="#F7B2C4" /></svg>;
  }
}
