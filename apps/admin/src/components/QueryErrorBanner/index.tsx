'use client';

import { useEffect, useState } from 'react';

const EVENT = 'admin:query-error';

type QueryError = { id: number; operation: string; message: string };

/**
 * Apollo 에러 링크가 부르는 발행 함수. 컴포넌트 대부분이 error 를 안 읽어 실패가 "결과 없음"으로 위장되던 것을
 * 한 곳에서 드러낸다 — 페이지별 에러 UI 가 없어도 실패는 이 배너로 보인다.
 */
export const reportQueryError = (operation: string, message: string) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { operation, message } }));
};

let seq = 0;

const QueryErrorBanner = () => {
  const [errors, setErrors] = useState<QueryError[]>([]);

  useEffect(() => {
    const onError = (e: Event) => {
      const { operation, message } = (e as CustomEvent<Omit<QueryError, 'id'>>).detail;
      setErrors((prev) =>
        prev.some((x) => x.operation === operation && x.message === message)
          ? prev
          : [...prev.slice(-4), { id: ++seq, operation, message }],
      );
    };
    window.addEventListener(EVENT, onError);
    return () => window.removeEventListener(EVENT, onError);
  }, []);

  if (errors.length === 0) return null;

  return (
    <div className="mb-4 space-y-1" role="alert">
      {errors.map((err) => (
        <div
          key={err.id}
          className="flex items-start gap-2 rounded border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          <span className="font-bold">요청 실패</span>
          <span className="font-medium">{err.operation}</span>
          <span className="min-w-0 flex-1 break-all">{err.message}</span>
          <button
            onClick={() => setErrors((prev) => prev.filter((x) => x.id !== err.id))}
            className="shrink-0 px-1 font-bold"
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default QueryErrorBanner;
