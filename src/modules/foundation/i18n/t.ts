export type Lang = 'en' | 'hi';
export type Params = Record<string, string | number>;
type Catalogue = Readonly<Record<string, string>>;

/** Replace `{name}` placeholders. Unknown placeholders stay visible so a missing param is noticed, not hidden. */
export function format(template: string, params: Params = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

const pluralRules: Partial<Record<Lang, Intl.PluralRules>> = {};
function pluralCategory(lang: Lang, count: number): string {
  const rules = (pluralRules[lang] ??= new Intl.PluralRules(lang === 'hi' ? 'hi-IN' : 'en-IN'));
  return rules.select(count);
}

/**
 * Look up `key` in `catalogue`. With a numeric `count` param, `key_<category>` (Intl plural category) is tried,
 * then `key_other`. Falls back to the key itself so gaps are visible in the UI and in tests.
 */
export function translate(catalogue: Catalogue, lang: Lang, key: string, params?: Params): string {
  const direct = catalogue[key];
  if (direct !== undefined) return format(direct, params);
  const count = params?.count;
  if (typeof count === 'number') {
    const plural = catalogue[`${key}_${pluralCategory(lang, count)}`] ?? catalogue[`${key}_other`];
    if (plural !== undefined) return format(plural, params);
  }
  return key;
}
