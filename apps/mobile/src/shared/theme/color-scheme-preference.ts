import {useEffect, useState} from 'react';
import {Appearance} from 'react-native';

import {StorageKey} from '@/shared/constant/storage-key';
import {
  getAsyncStorage,
  setAsyncStorage,
} from '@/shared/lib/persistence/async-storage';

/** 내정보 > 화면 모드. 'system' = OS 설정을 따른다(기본). */
export type ColorSchemePreference = 'system' | 'light' | 'dark';

export const COLOR_SCHEME_LABEL: Record<ColorSchemePreference, string> = {
  system: '시스템 설정',
  light: '라이트',
  dark: '다크',
};

const isPreference = (v: unknown): v is ColorSchemePreference =>
  v === 'system' || v === 'light' || v === 'dark';

/**
 * 앱 전체 모드를 바꾼다 — className 토큰·useColors·키보드·알럿·네이티브 탭바가 모두 이 값을 따른다.
 * null 이면 OS 설정으로 돌아간다.
 */
function apply(preference: ColorSchemePreference) {
  Appearance.setColorScheme(preference === 'system' ? null : preference);
}

/**
 * 앱 시작 때 저장된 선택을 다시 건다. 저장소를 읽는 몇 ms 동안은 OS 설정으로 그려진다
 * (그 사이는 스플래시가 덮는다).
 */
export function restoreColorSchemePreference() {
  getAsyncStorage(StorageKey.COLOR_SCHEME)
    .then(stored => {
      if (isPreference(stored) && stored !== 'system') apply(stored);
    })
    .catch(() => {});
}

/** 내정보 화면용 — 현재 선택과 바꾸는 함수. */
export function useColorSchemePreference() {
  const [preference, setPreference] = useState<ColorSchemePreference>('system');

  useEffect(() => {
    getAsyncStorage(StorageKey.COLOR_SCHEME)
      .then(stored => {
        if (isPreference(stored)) setPreference(stored);
      })
      .catch(() => {});
  }, []);

  const change = (next: ColorSchemePreference) => {
    setPreference(next);
    apply(next);
    setAsyncStorage(StorageKey.COLOR_SCHEME, next).catch(() => {});
  };

  return [preference, change] as const;
}
