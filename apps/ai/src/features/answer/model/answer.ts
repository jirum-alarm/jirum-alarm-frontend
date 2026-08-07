import type {
  AnswerState,
  CommentSummary,
  Deal,
  PartialReason,
  PriceConfidence,
  PricePoint,
  PricePosition,
  RefusalReason,
} from './types';

/**
 * 답변은 블록의 나열이다. 서버가 계산 순서대로 하나씩 흘려보내고
 * 클라이언트는 도착한 것만 렌더한다 — 전체 payload 를 기다리지 않는다.
 *
 * 블록을 타입으로 나눈 이유: 컴포넌트가 블록 한 종류만 알면 되고,
 * 새 블록(예: 가격추이)을 추가할 때 기존 컴포넌트를 건드리지 않는다.
 */
export type AnswerBlock =
  | { kind: 'verdict'; dealCount: number; lowest: number | null }
  | { kind: 'partial'; reason: PartialReason | RefusalReason; filteredCount: number }
  | { kind: 'distribution'; prices: number[] }
  /** "지금 사도 되나" — 같은 상품 과거 딜 대비 위치. 근거가 약하면 애초에 안 온다. */
  | { kind: 'position'; position: PricePosition; title: string }
  /** 90일 추이 — position 이 "싼가"에, 이건 "더 싸질까"에 답한다. 같은 points 를 쓴다. */
  | { kind: 'trend'; points: PricePoint[]; current: number; confidence: PriceConfidence }
  | { kind: 'review'; summary: CommentSummary; title: string }
  | { kind: 'deals'; deals: Deal[]; lowest: number | null }
  /** 되묻기 제안. 답이 끝난 자리에 다음 질문을 놓는다 — 답할 수 있는 것만. */
  | { kind: 'followUp'; suggestions: string[] }
  | { kind: 'failure'; message: string };

/** 한 턴의 최종 상태. state 는 게이트 판정 원본(디버깅·분석용). */
export type AnswerPayload = {
  keyword: string;
  state: AnswerState;
  blocks: AnswerBlock[];
};
