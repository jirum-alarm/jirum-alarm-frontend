'use client';

import ServerError from '@/components/ServerError';

export default function ProductDetailError({ reset }: { reset: () => void }) {
  return <ServerError onClick={reset} />;
}
