'use client';

import ServerError from '@shared/ui/ServerError';

export default function ProductDetailError({ reset }: { reset: () => void }) {
  return <ServerError onClick={reset} />;
}
