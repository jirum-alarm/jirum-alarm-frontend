'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

import ServerError from '@/shared/ui/ServerError';

// 루트 레이아웃 아래 모든 라우트 그룹((desktop-ready)·(mobile)·promotion 등)의 렌더 오류 경계.
// 이게 없으면 페이지 하나의 오류가 global-error 까지 올라가 루트 레이아웃(폰트·테마·프로바이더)째 갈아 끼운다.
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <ServerError onClick={reset} />;
}
