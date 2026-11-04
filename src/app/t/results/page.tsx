'use client';

import { Suspense } from 'react';
import { PaperSkeleton } from '@/modules/foundation';
import { Results } from '@/modules/insights';

export default function Page() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-xl px-4 py-6"><PaperSkeleton /></main>}>
      <Results />
    </Suspense>
  );
}
