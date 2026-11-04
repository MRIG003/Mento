'use client';

import { useState } from 'react';
import { DEMO_NAMES, type ClassSummary, type Repositories, type TeacherScope } from '@/modules/data';
import type { SubjectId } from '@/modules/domain';
import { Badge, Button, Card, Field, RadioChips, StickyNote, inputClass, useI18n } from '@/modules/foundation';
import type { Services } from '@/modules/services';

type StepProps = { onDone: () => void };

export function StepOtp({ services, onDone }: StepProps & { services: Services }) {
  const { t } = useI18n();
  const [phone, setPhone] = useState('');
  const [request, setRequest] = useState<{ id: string; code?: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    const r = await services.otp.requestCode(phone);
    setBusy(false);
    if (!r.ok) { setError(t(r.error.messageKey)); return; }
    setError(null);
    setRequest({ id: r.value.requestId, ...(r.value.previewCode ? { code: r.value.previewCode } : {}) });
  };
  const verify = async () => {
    if (!request) return;
    setBusy(true);
    const r = await services.otp.verify(request.id, code);
    setBusy(false);
    if (!r.ok) { setError(t(r.error.messageKey)); return; }
    onDone();
  };

  return (
    <Card title={t('onb.otp.title')} titleId="step-otp">
      <p className="mb-4 text-ink-muted">{t('onb.otp.body')}</p>
      {!request ? (
        <div className="flex flex-col gap-3">
          <Field label={t('onb.otp.phone')} error={error}>
            {(c) => <input {...c} className={inputClass} type="tel" inputMode="numeric" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />}
          </Field>
          <Button onClick={send} busy={busy}>{t('onb.otp.send')}</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="flex flex-wrap items-center gap-2 rounded-xl bg-paper p-3 text-sm font-bold"><Badge kind="preview" />{t('onb.otp.previewNote', { code: request.code ?? '' })}</p>
          <Field label={t('onb.otp.code')} error={error}>
            {(c) => <input {...c} className={inputClass} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />}
          </Field>
          <Button onClick={verify} busy={busy}>{t('onb.otp.verify')}</Button>
        </div>
      )}
    </Card>
  );
}

export function StepProfile({ repos, onDone }: StepProps & { repos: Repositories }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const missing = (v: string) => (tried && !v.trim() ? t('onb.profile.required') : null);
  const save = async () => {
    setTried(true);
    if (!name.trim() || !school.trim()) return;
    setBusy(true);
    const r = await repos.session.startTeacher({ name, schoolName: school });
    setBusy(false);
    if (r.ok) onDone();
  };
  return (
    <Card title={t('onb.profile.title')} titleId="step-profile">
      <div className="flex flex-col gap-4">
        <Field label={t('onb.profile.name')} hint={t('onb.profile.nameHint')} error={missing(name)} required>
          {(c) => <input {...c} className={inputClass} autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label={t('onb.profile.school')} error={missing(school)} required>
          {(c) => <input {...c} className={inputClass} autoComplete="organization" maxLength={80} value={school} onChange={(e) => setSchool(e.target.value)} />}
        </Field>
        <Button onClick={save} busy={busy}>{t('onb.continue')}</Button>
      </div>
    </Card>
  );
}

export function StepClass({ teacher, onDone }: StepProps & { teacher: TeacherScope }) {
  const { t } = useI18n();
  const [grade, setGrade] = useState<number | null>(6);
  const [section, setSection] = useState<string | null>('A');
  const [subject, setSubject] = useState<string | null>('maths');
  const [lang, setLang] = useState<'en' | 'hi' | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = grade !== null && section !== null && subject !== null && lang !== null;
  const create = async () => {
    if (!ready) return;
    setBusy(true);
    const r = await teacher.createClass({ grade, section, subjectId: subject as SubjectId, defaultLang: lang });
    setBusy(false);
    if (r.ok) onDone();
  };
  return (
    <Card title={t('onb.class.title')} titleId="step-class">
      <div className="flex flex-col gap-5">
        <RadioChips legend={t('onb.class.grade')} value={grade} onChange={setGrade} options={[3, 4, 5, 6, 7, 8].map((g) => ({ value: g, label: String(g) }))} />
        <RadioChips legend={t('onb.class.section')} value={section} onChange={setSection} options={['A', 'B', 'C', 'D', 'E'].map((s) => ({ value: s, label: s }))} />
        <RadioChips legend={t('onb.class.subject')} value={subject} onChange={setSubject} options={[{ value: 'maths', label: t('subject.maths') }, { value: 'hindi', label: t('subject.hindi') }, { value: 'science', label: t('subject.science') }]} />
        <RadioChips legend={t('onb.class.lang')} hint={t('onb.class.langHint')} value={lang} onChange={setLang} options={[{ value: 'hi', label: 'हिन्दी', lang: 'hi' }, { value: 'en', label: 'English', lang: 'en' }]} />
        <Button onClick={create} busy={busy} disabled={!ready}>{t('onb.class.create')}</Button>
      </div>
    </Card>
  );
}

export function StepRoster({ teacher, services, summary, onDone, onSkip }: StepProps & { teacher: TeacherScope; services: Services; summary: ClassSummary; onSkip: () => void }) {
  const { t } = useI18n();
  const [list, setList] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const joinUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/join#k=${summary.class.joinToken}`;
  const message = t('onb.roster.joinMessage', { class: summary.label, link: joinUrl });

  const add = async (names: string[]) => {
    const r = await teacher.addStudents(summary.class.id, names);
    if (!r.ok) setError(t(r.error.messageKey));
    else { setError(null); setList(''); }
  };
  const shared = () => { void teacher.recordEvent('join-link-shared', { classId: summary.class.id }); };

  return (
    <div className="flex flex-col gap-4">
      <Card title={t('onb.roster.title')} titleId="step-roster">
        <p className="text-ink-muted">{t('onb.roster.body')}</p>
        <p className="mt-3 text-lg font-extrabold" aria-live="polite">{t('onb.roster.count', { count: summary.studentCount })}</p>
      </Card>
      <StickyNote color="mint" rotate={0.6} as="section">
        <h3 className="font-extrabold">{t('onb.roster.shareTitle')}</h3>
        <p className="mt-1 text-sm">{t('onb.roster.shareBody')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a className="inline-flex min-h-tap items-center rounded-full bg-primary px-5 font-extrabold text-card" href={services.share.whatsappUrl(message)} target="_blank" rel="noopener noreferrer" onClick={shared}>{t('onb.roster.whatsapp')}</a>
          <Button variant="secondary" onClick={async () => { const r = await services.share.copyLink(joinUrl); setCopied(r.ok); if (r.ok) shared(); }}>{t(copied ? 'onb.roster.copied' : 'onb.roster.copy')}</Button>
        </div>
      </StickyNote>
      <Card>
        <Field label={t('onb.roster.pasteTitle')} hint={t('onb.roster.pasteHint')} error={error}>
          {(c) => <textarea {...c} className={`${inputClass} min-h-28`} value={list} onChange={(e) => setList(e.target.value)} />}
        </Field>
        <Button variant="secondary" className="mt-3" disabled={!list.trim()} onClick={() => add(list.split(/\r?\n|,/).slice(0, 200))}>{t('onb.roster.pasteAdd')}</Button>
        <p className="mt-4 text-sm font-bold">{t('onb.roster.demoTitle')}</p>
        <Button variant="quiet" onClick={() => add(DEMO_NAMES)}>{t('onb.roster.demo')}</Button>
      </Card>
      <Button onClick={onDone} disabled={summary.studentCount === 0}>{t('onb.continue')}</Button>
      <Button variant="quiet" onClick={onSkip}>{t('onb.skip')}</Button>
    </div>
  );
}

export function StepConsent({ onDone }: StepProps) {
  const { t } = useI18n();
  return (
    <Card title={t('onb.consent.title')} titleId="step-consent">
      <p className="text-ink-muted">{t('onb.consent.body')}</p>
      <StickyNote color="blue" rotate={-0.8} className="my-4 text-lg font-bold">{t('onb.consent.sample')}</StickyNote>
      <p className="mb-4 text-sm text-ink-muted">{t('onb.consent.more')}</p>
      <Button onClick={onDone}>{t('onb.consent.ok')}</Button>
    </Card>
  );
}
