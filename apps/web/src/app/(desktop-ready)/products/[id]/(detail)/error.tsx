'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

import ServerError from '@/shared/ui/ServerError';

// 가장 많이 보는 상세 화면의 오류 경계 — 루트 경계(app/error.tsx)와 달리 보고를 안 해 사용자가 오류 화면을 봐도 어디에도 안 남았다.
export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { boundary: 'product-detail' } });
  }, [error]);

  return <ServerError onClick={reset} />;
}
