'use client';

import { useMode } from './Providers';
import ProPortfolio from './ProPortfolio';
import FunPortfolio from './FunPortfolio';
import { Terminal } from './Terminal';

export function Portfolio() {
  const { mode } = useMode();
  return (
    <>
      {mode === 'fun' ? <FunPortfolio /> : <ProPortfolio />}
      <Terminal />
    </>
  );
}
