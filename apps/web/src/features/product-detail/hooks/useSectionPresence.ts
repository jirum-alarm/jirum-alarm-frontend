'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { createSectionStore } from '../lib/section-presence';

// 페이지(브라우저 탭) 하나에 상세는 하나만 그려진다 — 모듈 하나로 충분하다.
const store = createSectionStore();

/** 이 섹션이 지금 그려져 있다고 알린다(active 가 false 거나 언마운트되면 뺀다). */
export function useRegisterSection(id: string, active: boolean) {
  useEffect(() => {
    if (!active) return;
    store.add(id);
    return () => store.remove(id);
  }, [id, active]);
}

/** 섹션 존재 확인 함수 — 등록·해제 때마다 다시 그린다. 서버 렌더에선 늘 없음. */
export function useSectionPresence(): (id: string) => boolean {
  useSyncExternalStore(store.subscribe, store.version, () => -1);
  return store.has;
}
