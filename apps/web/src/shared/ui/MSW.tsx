'use client';

import { useEffect, useState } from 'react';

import { IS_API_MOCKING } from '@shared/config/env';

export default function MSW() {
  const [enableMocking, setEnableMocking] = useState(false);

  useEffect(() => {
    if (!IS_API_MOCKING) {
      return;
    }

    if (typeof window !== 'undefined' && !enableMocking) {
      (async () => {
        const { worker } = await import('@/mocks/browser');
        await worker.start();
        console.log('[MSW] MSWInit success');
        setEnableMocking(true);
      })();
    }
  }, [enableMocking]);

  return null;
}
