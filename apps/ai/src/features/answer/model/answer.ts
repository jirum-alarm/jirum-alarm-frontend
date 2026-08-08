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
  /** LLM 생성 문장. `patch` 이벤트로 토큰이 이어붙는다(처음엔 빈 문자열로 온다). */
  | { kind: 'text'; markdown: string }
  /** 되묻기 제안. 답이 끝난 자리에 다음 질문을 놓는다 — 답할 수 있는 것만. */
  | { kind: 'followUp'; suggestions: string[] }
  | { kind: 'failure'; message: string };

/**
 * 스트림 이벤트.
 *
 * ★정본은 **chat 서버**(`jirum-alarm-chat/src/contract/answer-block.ts`)다.
 * 별도 레포라 npm 패키지로 빼지 않고 같은 모양을 복사해 쓴다 — 계약 한 줄 고칠 때마다
 * publish→bump→install 왕복이 사이드 프로젝트엔 이득보다 비싸다.
 * 안전망은 `AnswerBubble` 의 `block satisfies never` 가 맡는다(case 누락 시 컴파일 실패).
 *
 * ⚠️ 여기를 고치면 서버 쪽 `contract/answer-block.ts` 도 같이 고쳐야 한다.
 */
export type AskEvent =
  /**
   * 쿼터 현황. **서버가 정본**이라 응답 첫머리에 온다.
   * 프론트는 이 값만 믿는다 — 로컬에서 따로 세면 두 카운터가 어긋나
   * 답변 스트리밍 중에 "다 썼어요" 벽이 같이 뜬다(실측 2026-08-08).
   */
  | { type: 'quota'; tier: 'anon' | 'member' | 'paid'; used: number; limit: number }
  /** 진행 표시 — 사라져도 됨 */
  | { type: 'stage'; label: string }
  /** 결과 — 남아야 함. id 가 React key 이자 patch 대상이다. */
  | { type: 'block'; id: string; block: AnswerBlock }
  /** 토큰 스트리밍 — id 로 기존 블록을 찾아 이어붙인다 */
  | { type: 'patch'; id: string; delta: string }
  /** 새 대화 id. 첫 이벤트로 와서 프론트가 URL 을 교체한다. */
  | { type: 'conversation'; conversationId: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

/** 한 턴의 최종 상태. state 는 게이트 판정 원본(디버깅·분석용). */
export type AnswerPayload = {
  keyword: string;
  state: AnswerState;
  blocks: AnswerBlock[];
};
