'use client';

import { useState } from 'react';

/** T2 placeholder: proves hydration works under the CSP (a click handler must run). Replaced in T23. */
export default function Home() {
  const [taps, setTaps] = useState(0);
  return (
    <main>
      <h1>{'Mento'}</h1>
      <button type="button" onClick={() => setTaps((n) => n + 1)} data-testid="hydration-probe">
        {`taps: ${taps}`}
      </button>
    </main>
  );
}
