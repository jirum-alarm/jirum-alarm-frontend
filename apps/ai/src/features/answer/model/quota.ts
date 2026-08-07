/**
 * 무료 쿼터 정책 — **목업**. 서버 강제가 아니라 화면 흐름을 보기 위한 것이다.
 *
 * 3단 게이트: 익명 3회 → 로그인 10회/일 → 유료.
 *
 * 숫자 근거
 *  - 익명 3: 1~2회는 맛보기가 안 된다. 첫 질문은 오타·애매한 검색어로 날아가는 일이 잦아
 *    2회면 제대로 된 답을 한 번도 못 본 채 벽에 닿는다. 3회면 한 번 실패해도 한 번은 본다.
 *  - 로그인 10/일: 실사용 한 세션이 3~5질문. "가입하면 넉넉하다"는 체감을 주면서도
 *    매일 쓰면 이틀 안에 다음 벽에 닿는다.
 *  - 유료 300/월: 하루 10회를 매일 쓰는 사람 기준. **무제한은 걸지 않는다** —
 *    질문 1건이 운영 GraphQL 호출 1건이라 그대로 원가고, 무제한은 되돌리기 어렵다.
 *
 * 리셋은 **일 단위 고정 창(KST 자정)**, 슬라이딩 윈도가 아니다.
 * "내일 다시 오세요"는 설명되지만 "몇 시간 뒤"는 설명이 안 되고, 재방문을 만드는 건 전자다.
 *
 * ponytail: 레이트리밋(rateLimit.ts, IP 20회/분)과 별개로 유지한다. 둘을 합치면
 * 스크립트 폭주가 유료 유저의 쿼터를 태운다. 남용 방지와 과금 경계는 다른 축이다.
 */

export type Tier = 'anon' | 'member' | 'paid';

export const QUOTA: Record<Tier, { limit: number; period: '일' | '월' }> = {
  anon: { limit: 3, period: '일' },
  member: { limit: 10, period: '일' },
  paid: { limit: 300, period: '월' },
};

export type QuotaState = { tier: Tier; used: number };

export const remaining = ({ tier, used }: QuotaState) => Math.max(0, QUOTA[tier].limit - used);

export const isBlocked = (s: QuotaState) => remaining(s) === 0;

/**
 * 남은 횟수를 언제 알릴지. **마지막 1회에서 예고 없이 막히는 게 이탈 지점**이라
 * 벽에 닿기 전에 미리 보여준다. 익명은 3회뿐이라 처음부터, 나머지는 막바지에만.
 */
export const shouldWarn = (s: QuotaState) =>
  !isBlocked(s) && (s.tier === 'anon' || remaining(s) <= 3);

/** 벽에 닿았을 때 다음 단계. 유료는 더 올려보낼 곳이 없다. */
export const nextTier = (tier: Tier): Tier | null =>
  tier === 'anon' ? 'member' : tier === 'member' ? 'paid' : null;
