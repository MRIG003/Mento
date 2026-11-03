'use client';

import { Suspense } from 'react';
import { PaperSkeleton } from '@/modules/foundation';
import { Create } from '@/modules/homework';

// useSearchParams needs a Suspense boundary to keep the route static (Next 16 docs: use-search-params).
export default function Page() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-xl px-4 py-6"><PaperSkeleton /></main>}>
      <Create />
    </Suspense>
  );
}
