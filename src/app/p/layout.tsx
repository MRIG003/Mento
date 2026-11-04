import type { ReactNode } from 'react';
import { RoleShell } from '@/modules/foundation';

export default function PrincipalLayout({ children }: { children: ReactNode }) {
  return <RoleShell role="principal">{children}</RoleShell>;
}
