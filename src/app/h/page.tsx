'use client';

import dynamic from 'next/dynamic';
import { PaperSkeleton } from '@/modules/foundation';
import { LinkFlow } from '@/modules/student-link';

// The camera code is loaded only when a child opens a photo question (SPEC §8: lazy-load capture).
const PhotoCapture = dynamic(() => import('@/modules/capture').then((m) => m.Capture), { ssr: false, loading: () => <PaperSkeleton lines={2} /> });

export default function Page() {
  return <LinkFlow photoCapture={PhotoCapture} />;
}
