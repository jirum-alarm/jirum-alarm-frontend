'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface ConfirmOptions {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  /** 삭제·반려처럼 되돌리기 어려운 동작이면 확인 버튼을 빨갛게 */
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

interface Pending extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

const ConfirmContext = createContext<ConfirmFn | null>(null);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [pending, setPending] = useState<Pending | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise<boolean>((resolve) => {
        // 이전 창이 떠 있으면 취소로 닫는다 — 기다리던 쪽이 영원히 멈추지 않게
        setPending((prev) => {
          prev?.resolve(false);
          return { ...options, resolve };
        });
      }),
    [],
  );

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending],
  );

  useEffect(() => {
    if (!pending) return;
    // 브라우저 confirm 처럼 확인 버튼에 포커스 — Enter 는 확인, Esc 는 취소
    confirmButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pending, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center bg-black/40 p-4"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-default dark:bg-boxdark"
            onClick={(e) => e.stopPropagation()}
          >
            {pending.title && (
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                {pending.title}
              </h3>
            )}
            <p className="text-sm whitespace-pre-line text-black dark:text-white">
              {pending.message}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-md border border-stroke px-4 py-2 text-sm text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                {pending.cancelText ?? '취소'}
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={() => close(true)}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                  pending.danger ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {pending.confirmText ?? '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmContext);
  // 공급자 없이 조용히 true/false 를 돌려주면 삭제가 확인 없이 나가거나 영영 막힌다
  if (!ctx) throw new Error('useConfirm 은 ConfirmProvider 안에서만 쓸 수 있습니다');
  return ctx;
};
