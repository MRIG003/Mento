/**
 * Turn pasted text into a safe in-app path. Only the route (/h or /join), the 22-char token and en|hi survive;
 * everything else (host, scheme, other params) is dropped (threat model T3).
 */
export function linkPathFromPaste(text: string): string | null {
  const match = /\/(h|join)\/?#([^\s]+)/.exec(text);
  if (!match) return null;
  const params = new URLSearchParams(match[2]);
  const token = params.get('k');
  if (!token || !/^[A-Za-z0-9_-]{22}$/.test(token)) return null;
  const lang = params.get('lang');
  return `/${match[1]}#k=${token}${lang === 'en' || lang === 'hi' ? `&lang=${lang}` : ''}`;
}
