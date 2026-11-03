import { describe, expect, it } from 'vitest';
import { TEACHER_FLOW, nextTeacherStep, stepNumber } from './progress';

describe('teacher onboarding flow', () => {
  it('has seven visible steps ending at the first practice', () => {
    expect(TEACHER_FLOW).toEqual(['otp', 'profile', 'class', 'roster', 'consent', 'mission', 'firstPractice']);
    expect(stepNumber('class')).toEqual({ n: 3, total: 7 });
  });
  it('starts at the beginning', () => expect(nextTeacherStep({})).toBe('otp'));
  it('resumes at the first step that is neither done nor skipped', () => {
    expect(nextTeacherStep({ otp: 'done', profile: 'done', class: 'done', roster: 'skipped' })).toBe('consent');
    expect(nextTeacherStep({ otp: 'done', profile: 'todo' })).toBe('profile');
  });
  it('is finished when every step is done or skipped', () => {
    const all = Object.fromEntries(TEACHER_FLOW.map((s) => [s, 'done'])) as never;
    expect(nextTeacherStep(all)).toBeNull();
  });
});
