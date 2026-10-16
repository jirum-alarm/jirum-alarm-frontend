'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

// 루트 레이아웃까지 깨졌을 때의 마지막 화면 — 레이아웃·전역 CSS 가 없을 수 있어 스타일은 인라인,
// 색은 시스템 색(Canvas·CanvasText)이라 다크 모드도 따라간다. 예전엔 Next 기본 영어 화면이라 빠져나갈 버튼이 없었다.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko" style={{ colorScheme: 'light dark' }}>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 20,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: 'Canvas',
          color: 'CanvasText',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>화면을 불러오지 못했어요</p>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>잠시 뒤 다시 시도해 주세요.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              minHeight: 44,
              padding: '0 20px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            다시 시도
          </button>
          {/* 전체 새로 고침으로 홈에 간다 — 클라이언트 라우터가 깨진 상태일 수 있다. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 20px',
              fontSize: 15,
              color: 'inherit',
            }}
          >
            홈으로
          </a>
        </div>
      </body>
    </html>
  );
}
