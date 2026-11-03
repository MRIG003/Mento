import { notFound } from 'next/navigation';
import { Kit } from './Kit';

/** Development-only component kit. Production builds return 404 for this route. */
export default function KitPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Kit />;
}
