'use client';

// useSuspenseQuery 등 렌더 중 던져진 에러가 흰 화면이 되지 않게 — 사유를 보여주고 다시 시도할 수 있게 한다
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="m-6 rounded-sm border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
      <p className="mb-1 font-bold">화면을 그리지 못했습니다</p>
      <p className="mb-3 break-all">{error.message}</p>
      <button onClick={reset} className="rounded-sm bg-danger px-3 py-1 text-white">
        다시 시도
      </button>
    </div>
  );
}
