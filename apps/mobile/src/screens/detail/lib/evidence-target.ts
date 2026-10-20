import {DealEvidenceKind} from '@/shared/api/gql/graphql';

/** 「근거 보기」가 내려갈 섹션 — 다나와 근거는 블록 안 숫자가 근거라 없다. */
export type EvidenceTarget = 'priceHistory' | 'community';

/** 섹션이 실제로 그려져 위치를 아는지. 상세 화면이 섹션 onLayout 으로 채운다. */
export type EvidenceTargetsReady = Record<EvidenceTarget, boolean>;

/**
 * 근거 종류 → 「근거 보기 ›」가 내려갈 섹션. 그 섹션이 아직 안 그려졌으면(가격 추이 로딩 중·점 2개 미만·holdout,
 * 유저 등록 딜이라 커뮤니티 반응 없음) null — 링크를 숨긴다. 예전엔 링크만 떠 있고 눌러도 아무 일이 없었다
 * (web 과 같은 원칙, Clarity dead click 2026-10-20).
 */
export function evidenceMoreTarget(
  kind: DealEvidenceKind | null | undefined,
  ready: EvidenceTargetsReady,
): EvidenceTarget | null {
  const target: EvidenceTarget | null =
    kind === DealEvidenceKind.History
      ? 'priceHistory'
      : kind === DealEvidenceKind.Community
      ? 'community'
      : null;
  return target && ready[target] ? target : null;
}
