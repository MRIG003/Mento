import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontVariables } from '@/modules/foundation';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mento',
  description: 'Homework that shows who is stuck, on which concept, and what to do next.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F3EBDD',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
