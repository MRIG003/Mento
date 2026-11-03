/** Late means strictly after the due instant; exactly on time is on time (SPEC-domain). */
export function isLate(submittedAt: string, dueAt: string): boolean {
  return Date.parse(submittedAt) > Date.parse(dueAt);
}
