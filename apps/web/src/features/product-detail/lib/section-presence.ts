/**
 * 상세에서 «지금 그려져 있는 섹션» 목록. 가격 아래 근거 블록의 「근거 보기 ›」가 내려갈 곳(가격 추이·커뮤니티 반응)이
 * 실제로 그려졌을 때만 링크를 보이려고 둔다 — 예전엔 대상이 없을 때(로딩 중·점 2개 미만·holdout·유저 등록 딜)도
 * 링크가 떠서 눌러도 아무 일이 없었다(Clarity dead click, 2026-10-20).
 *
 * 섹션이 자기 조건을 스스로 판단해 등록하므로, 근거 블록이 섹션의 표시 조건을 따로 다시 적지 않는다(조건이 갈리지 않게).
 */
export type SectionStore = {
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  subscribe: (listener: () => void) => () => void;
  /** 있음/없음이 바뀔 때마다 1씩 — useSyncExternalStore 스냅샷. */
  version: () => number;
};

export function createSectionStore(): SectionStore {
  const present = new Map<string, number>();
  const listeners = new Set<() => void>();
  let version = 0;
  const emit = () => {
    version++;
    listeners.forEach((l) => l());
  };
  return {
    has: (id) => (present.get(id) ?? 0) > 0,
    add(id) {
      const n = present.get(id) ?? 0;
      present.set(id, n + 1);
      if (n === 0) emit();
    },
    remove(id) {
      const n = present.get(id) ?? 0;
      if (n <= 1) present.delete(id);
      else present.set(id, n - 1);
      if (n === 1) emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    version: () => version,
  };
}

/** 근거 종류 → 「근거 보기」가 내려갈 섹션 id. 다나와 근거는 블록 안 숫자가 근거라 링크가 없다. */
export const EVIDENCE_SCROLL_TARGET: Record<string, string | undefined> = {
  HISTORY: 'price-history',
  COMMUNITY: 'community-reaction',
};

/** 「근거 보기」를 띄울 대상 섹션 — 대상이 지금 그려져 있지 않으면 null(링크를 숨긴다). */
export function evidenceScrollTarget(
  kind: string,
  isPresent: (id: string) => boolean,
): string | null {
  const target = EVIDENCE_SCROLL_TARGET[kind];
  return target && isPresent(target) ? target : null;
}
