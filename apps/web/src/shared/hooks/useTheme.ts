'use client';

import { atom, useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

// 초기값은 layout.tsx 인라인 스크립트가 이미 .dark를 적용한 뒤이므로, localStorage에서 읽는다.
const readStored = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'dark' || v === 'light' || v === 'system' ? v : 'system';
};

const themeAtom = atom<Theme>(readStored());

const resolveIsDark = (theme: Theme): boolean =>
  theme === 'dark' ||
  (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', resolveIsDark(theme));
};

/**
 * 다크모드 테마 훅. light/dark/system 3상태.
 * - 시맨틱 토큰(@jirum/design-tokens web.css의 .dark 블록)이 색을 전환하므로,
 *   이 훅은 `.dark` 클래스 토글 + localStorage 영속만 담당.
 * - FOUC 방지 초기 적용은 layout.tsx 인라인 스크립트가 처리.
 */
export const useTheme = () => {
  const [theme, setThemeState] = useAtom(themeAtom);

  const setTheme = useCallback(
    (next: Theme) => {
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      setThemeState(next);
    },
    [setThemeState],
  );

  // system 모드일 때 OS 테마 변경을 실시간 반영.
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  return { theme, setTheme };
};
