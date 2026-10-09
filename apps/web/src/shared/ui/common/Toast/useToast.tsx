import { useEffect, useState } from 'react';

/**
 * 토스트 — 앱 showToast(success·error·info)와 같은 종류·같은 표시 시간.
 * 예전 web 은 종류가 없어 "등록했어요" 와 "실패했어요" 가 똑같은 상자였다(앱이 먼저 겪고 고친 문제).
 * - success: 체크 아이콘. `action` 을 주면 오른쪽에 버튼(예: 보기·되돌리기) — 누를 시간을 주려고 4초.
 * - error: 느낌표 아이콘.
 * - info / `toast(message)`: 아이콘 없음(안내).
 */
export type ToastType = 'success' | 'error' | 'info';
export type ToastAction = { label: string; onClick: () => void };

interface ToastItem {
  id: string;
  type: ToastType;
  message: string | React.ReactNode;
  action?: ToastAction;
  show: boolean;
}

const VISIBLE_MS = 2500;
const VISIBLE_WITH_ACTION_MS = 4000;

let toasts: ToastItem[] = [];
let count = 0;

const genId = () => {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
};

const timeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners: Array<(toasts: ToastItem[]) => void> = [];

const emit = () => listeners.forEach((listener) => listener(toasts));

const hide = (id: string) => {
  toasts = toasts.map((t) => (t.id === id ? { ...t, show: false } : t));
  clearTimeout(timeouts.get(id));
  timeouts.delete(id);
  // 다 숨었으면 비운다(목록이 끝없이 쌓이지 않게).
  if (toasts.every((t) => !t.show)) toasts = [];
  emit();
};

const push = (type: ToastType, message: string | React.ReactNode, action?: ToastAction) => {
  const id = genId();
  toasts = [...toasts, { id, type, message, action, show: true }];
  emit();
  timeouts.set(
    id,
    setTimeout(() => hide(id), action ? VISIBLE_WITH_ACTION_MS : VISIBLE_MS),
  );
};

const toast = Object.assign((message: string | React.ReactNode) => push('info', message), {
  success: (message: string | React.ReactNode, options?: { action?: ToastAction }) =>
    push('success', message, options?.action),
  error: (message: string | React.ReactNode) => push('error', message),
  info: (message: string | React.ReactNode) => push('info', message),
  dismiss: hide,
});

export const useToast = () => {
  const [state, setState] = useState(toasts);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toast,
    toasts: state,
  };
};
