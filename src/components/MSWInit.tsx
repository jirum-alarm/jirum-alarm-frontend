'use client';

import { IS_API_MOCKING } from '@/constants/env';
import { useState } from 'react';

interface MSWInitProps {
  children: React.ReactNode;
}

const MSWInit = ({ children }: MSWInitProps) => {
  const [enableMocking, setEnableMocking] = useState(false);
  if (!IS_API_MOCKING) return <>{children}</>;
  if (typeof window !== 'undefined' && !enableMocking) {
    (async () => {
      const { worker } = await import('../mocks/browser');
      await worker.start();
      setEnableMocking(true);
    })();
  }
  return enableMocking ? <>{children}</> : null;
};

export default MSWInit;
