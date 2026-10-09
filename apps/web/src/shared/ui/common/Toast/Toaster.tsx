'use client';

import { toast as toastRecipe } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';

import { Toast } from './Toast';
import { useToast } from './useToast';

/** 앱 AppToast 의 SuccessIcon 과 같은 모양 — 라임 원 + 짙은 체크(판이 테마 무관 짙은 색이라 fixed). */
const SuccessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="shrink-0">
    <circle cx="10" cy="10" r="10" className="fill-primary-500" />
    <path
      d="M6 10.2l2.6 2.6L14 7.4"
      className="stroke-fixed-900"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/** 앱 AppToast 의 ErrorIcon 과 같은 모양 — 빨간 원 + 흰 느낌표. */
const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="shrink-0">
    <circle cx="10" cy="10" r="10" className="fill-error-400" />
    <path d="M10 5.5v5.5" className="stroke-fixed-white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="14.3" r="1.2" className="fill-fixed-white" />
  </svg>
);

const Toaster = () => {
  const { toasts, toast } = useToast();

  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} show={t.show}>
          {t.type === 'success' && <SuccessIcon />}
          {t.type === 'error' && <ErrorIcon />}
          <span className="min-w-0 flex-1">{t.message}</span>
          {t.action && (
            <button
              type="button"
              className={cn('shrink-0 active:opacity-60', toastRecipe.action)}
              onClick={() => {
                toast.dismiss(t.id);
                t.action?.onClick();
              }}
            >
              {t.action.label}
            </button>
          )}
        </Toast>
      ))}
    </>
  );
};

export default Toaster;
