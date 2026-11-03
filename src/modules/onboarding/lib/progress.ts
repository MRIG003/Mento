import type { OnboardingState, TeacherStep } from '@/modules/data';

/** Visible teacher steps (ADR-005). 'firstInsight' is tracked too but shown as part of the mission. */
export const TEACHER_FLOW = ['otp', 'profile', 'class', 'roster', 'consent', 'mission', 'firstPractice'] as const satisfies readonly TeacherStep[];
export type TeacherFlowStep = (typeof TEACHER_FLOW)[number];

export function nextTeacherStep(progress: OnboardingState['teacher']): TeacherFlowStep | null {
  return TEACHER_FLOW.find((step) => progress[step] !== 'done' && progress[step] !== 'skipped') ?? null;
}

export function stepNumber(step: TeacherFlowStep): { n: number; total: number } {
  return { n: TEACHER_FLOW.indexOf(step) + 1, total: TEACHER_FLOW.length };
}
