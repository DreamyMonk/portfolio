'use client';

import { useMode } from './Providers';

export function ModeToggle() {
  const { mode, setMode } = useMode();
  return (
    <div className="mode-toggle" role="group" aria-label="Site mode">
      <button type="button" aria-pressed={mode === 'pro'} onClick={() => setMode('pro')}>
        Pro
      </button>
      <button type="button" aria-pressed={mode === 'fun'} onClick={() => setMode('fun')}>
        Fun
      </button>
    </div>
  );
}
