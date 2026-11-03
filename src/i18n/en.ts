/**
 * English catalogue: the source of truth for keys. hi.ts must have every key (compile-time + catalogue.test.ts).
 * Plurals: `key_one` / `key_other`, used as t('key', { count }).
 */
export const en = {
  'common.appName': 'Mento',
  'common.whatsapp': 'WhatsApp',
  'common.demoData': 'Demo data',
  'common.preview': 'Preview',
  'common.late': 'Late',
  'common.loading': 'Loading…',
  'common.help': 'Help',
  'common.back': 'Back',
  'common.close': 'Close',
  'common.retry': 'Try again',
  'common.mainNav': 'Main',
  'common.notBuiltYet': 'This part of Mento is still being built.',
  'common.working': 'Working…',

  'status.stuck': 'stuck',
  'status.gettingThere': 'getting there',
  'status.onTrack': 'on track',
  'status.notEnough': 'not enough answers yet',

  'fraction.read': '{n} over {d}',
  'progress.percentRight': '{percent}% right',

  'coach.next': 'Next',
  'coach.done': 'Got it',
  'coach.skip': 'Skip tour',
  'coach.step': '{n} of {total}',

  'field.required': 'required',

  'check.reason.someKeyPoints': 'Some key points found. Please check.',
  'check.reason.noKeyPoints': 'Key points not found. Please check.',
  'check.reason.photo': 'Photo answer. Please check.',

  'lang.label': 'Language',
  'lang.en': 'English',
  'lang.hi': 'हिन्दी',
  'lang.switchEn': 'EN',
  'lang.switchHi': 'हिं',
  'lang.switchTo': 'Switch to {language}',

  'tab.teacher.desk': 'Desk',
  'tab.teacher.create': 'Create',
  'tab.teacher.results': 'Results',
  'tab.teacher.class': 'Class',
  'tab.principal.overview': 'Overview',
  'tab.principal.gaps': 'Gaps',
  'tab.principal.classes': 'Classes',
  'tab.principal.plan': 'Plan',
  'tab.student.today': 'Today',
  'tab.student.practice': 'Practice',
  'tab.student.progress': 'My progress',

  'error.generic.title': 'Something went wrong',
  'error.generic.body': 'Nothing you typed is lost. Please try again.',
  'error.notFound.title': 'This page isn’t here',
  'error.notFound.body': 'Go back, or open the link from WhatsApp again.',

  'children_one': '{count} child',
  'children_other': '{count} children',
} as const;

export type I18nKey = keyof typeof en;
export type Catalogue = Record<I18nKey, string>;
