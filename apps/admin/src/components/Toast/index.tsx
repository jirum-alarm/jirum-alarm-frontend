'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// 실패 문구는 원인을 읽을 시간이 필요하다 — alert 처럼 누를 때까지 남지는 않으니 두 배로 둔다
const DURATION: Record<ToastType, number> = { success: 2000, info: 2000, error: 4000 };

const STYLE: Record<ToastType, { bg: string; path: string }> = {
  success: { bg: 'bg-success', path: 'M5 13l4 4L19 7' },
  error: { bg: 'bg-danger', path: 'M6 18L18 6M6 6l12 12' },
  info: { bg: 'bg-primary', path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

const ToastContext = createContext<ToastApi | null>(null);

const Toast = ({ item, onDone }: { item: ToastItem; onDone: (id: number) => void }) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // 한 프레임 늦게 켜야 transition 이 시작 위치에서 출발한다
    const enter = requestAnimationFrame(() => setShown(true));
    const leave = setTimeout(() => setShown(false), DURATION[item.type]);
    const remove = setTimeout(() => onDone(item.id), DURATION[item.type] + 200);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, [item, onDone]);

  const style = STYLE[item.type];
  return (
    <div
      role={item.type === 'error' ? 'alert' : 'status'}
      onClick={() => onDone(item.id)}
      className={`flex cursor-pointer items-center gap-3 rounded-xl px-5 py-3.5 text-white shadow-lg transition-all duration-200 ${
        style.bg
      } ${shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.path} />
        </svg>
      </div>
      <span className="whitespace-pre-line font-medium">{item.message}</span>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api = useMemo<ToastApi>(() => {
    let seq = 0;
    const push = (type: ToastType) => (message: string) => {
      seq += 1;
      const id = Date.now() + seq;
      setItems((prev) => [...prev, { id, message, type }]);
    };
    return { success: push('success'), error: push('error'), info: push('info') };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-99999 flex -translate-x-1/2 flex-col items-center gap-2">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <Toast item={item} onDone={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  // 조용히 no-op 이 되면 실패 안내가 사라진 걸 아무도 모른다 — 마운트 누락은 바로 터뜨린다
  if (!ctx) throw new Error('useToast 는 ToastProvider 안에서만 쓸 수 있습니다');
  return ctx;
};
