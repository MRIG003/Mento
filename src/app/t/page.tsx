'use client';

import dynamic from 'next/dynamic';
import { Desk } from '@/modules/desk';

// The presenter's demo guide is loaded only on the Desk and only when demo data exists.
const DemoGuide = dynamic(() => import('@/modules/onboarding').then((m) => m.DemoGuide), { ssr: false });

export default function TeacherDeskPage() {
  return (
    <>
      <Desk />
      <DemoGuide />
    </>
  );
}
