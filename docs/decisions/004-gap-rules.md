# ADR-004: Evidence-based gap rules (and parent-report bands)

## Status
Accepted (Phase 2), 2026-11-03

## Context
One wrong answer does not prove a learning gap. Flags drive what the teacher does tomorrow, so false positives cost trust.

## Decision
- An attempt = an evaluation with verdict correct/incorrect after teacher overrides; `unsure` and unanswered don't count.
- **Student-concept:** flag `stuck` only if attempted ≥ 2 and correct < half (integer test `2c < a`); < 2 attempts → "not enough evidence".
- **Class-concept:** flag `class-gap` if attempted ≥ 3 across the class and correct rate < 60% (`10c < 6a`); < 3 attempts → "not enough evidence".
- **Parent-report bands** (extension): not yet = stuck; getting there = 50% ≤ rate < 80%; understood = ≥ 80%; each needs ≥ 2 attempts.
- Integer arithmetic only (no float boundary bugs). Boundary tests: 1 vs 2 attempts, 49% vs 50%, 59% vs 60%, 2 vs 3 attempts.

## Alternatives considered
- **Mastery models (BKT/IRT):** need far more data per student; opaque to teachers. Rejected for v1.
- **Any wrong answer = flag:** the noise the brief forbids. Rejected.

## Consequences
Small homework (one question per concept) often shows "not enough evidence". That's intended, and the bank suggestion picks ≥ 2 questions per concept.
