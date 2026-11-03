import type { Bilingual, LangCode } from '@/modules/domain';
import { translateIn } from '@/modules/foundation';

const pick = (b: Bilingual, lang: LangCode) => b[lang] ?? b.en ?? b.hi ?? '';

/** The WhatsApp message for a homework, in the homework's language. Class, subject, chapter, due and link only: no child data. */
export function homeworkMessage(input: { lang: LangCode; classLabel: string; subject: Bilingual; chapter: Bilingual; dueAt: string; url: string }): string {
  const due = new Intl.DateTimeFormat(input.lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', numberingSystem: 'latn' }).format(new Date(input.dueAt));
  return translateIn(input.lang, 'share.message', { class: input.classLabel, subject: pick(input.subject, input.lang), chapter: pick(input.chapter, input.lang), due, link: input.url });
}

/** The link children open. Token and language in the fragment, never sent to the server (ADR-009). */
export function homeworkUrl(origin: string, token: string, lang: LangCode): string {
  return `${origin}/h#k=${token}&lang=${lang}`;
}
