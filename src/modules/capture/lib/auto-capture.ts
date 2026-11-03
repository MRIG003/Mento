import { THRESHOLDS } from './thresholds';

/** Auto-capture once N consecutive frames are good (sharp, bright, steady, framed). */
export function createAutoCapture(needed: number = THRESHOLDS.autoCaptureFrames) {
  let streak = 0;
  return {
    /** Feed one assessment; returns true exactly when the streak reaches `needed`. */
    feed(ok: boolean): boolean {
      streak = ok ? streak + 1 : 0;
      return streak === needed;
    },
    reset() { streak = 0; },
  };
}
