import type { ReactNode } from 'react';
import { RoleShell } from '@/modules/foundation';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <RoleShell role="teacher">{children}</RoleShell>;
}
