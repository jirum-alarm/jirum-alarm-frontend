/**
 * 되묻기 제안 생성.
 *
 * 규칙 하나: **답할 수 있는 것만 제안한다.** 제안은 약속이라, 눌렀는데 거절 화면이 나오면
 * 빈 입력창보다 나쁘다. 그래서 화이트리스트(시세·평판) 안에서만 만들고,
 * 근거가 있는 것부터 넣는다.
 *
 * 문장은 상품 토큰(term)에 붙인다 — 원문 질의("생수 2L 24병 지금 사도 돼?")를 그대로
 * 재조합하면 "생수 2L 24병 지금 사도 돼? 요즘 얼마" 같은 말이 된다.
 */

/** 한 화면에 3개. 4개 넘으면 375px 에서 두 줄이 되고 선택 부담만 커진다. */
const MAX_SUGGESTIONS = 3;

export type FollowUpContext = {
  /** 상품 토큰 (extractProductTerm 결과) */
  term: string;
  /** 커뮤니티 요약을 이미 보여줬는지 — 보여줬으면 또 제안하지 않는다 */
  hasReview: boolean;
  /** 위치 판정을 보여줬는지 */
  hasPosition: boolean;
  /** 판정 결과. 비싸다고 했으면 "더 싼 것"이 가장 자연스러운 다음 질문이다. */
  verdict?: 'cheap' | 'normal' | 'pricey' | null;
};

export const buildFollowUps = ({
  term,
  hasReview,
  hasPosition,
  verdict = null,
}: FollowUpContext): string[] => {
  const t = term.trim();
  if (!t) return [];

  const out: string[] = [];

  /*
   * 판정이 "비싼 편"이면 유저의 다음 관심은 확정적으로 "그럼 싼 건?" 이다.
   * 제안 자리는 3개뿐이라, 맥락이 확실한 이것을 맨 앞에 놓는다.
   */
  if (verdict === 'pricey') out.push(`${t} 싼 거 추천`);

  // 위치 판정이 안 나왔으면(근거 부족) 시세부터 다시 물어보게 — 다른 표현이 게이트를 통과할 수 있다
  if (!hasPosition) out.push(`${t} 요즘 얼마`);

  // 평판은 commentSummary 커버리지가 10% 라 이미 나왔으면 중복 제안 금지
  if (!hasReview) out.push(`${t} 후기 어때`);

  // 항상 유효한 축 — 같은 상품의 최저가는 게이트와 무관하게 목록으로 답할 수 있다
  out.push(`${t} 최저가`);

  return [...new Set(out)].slice(0, MAX_SUGGESTIONS);
};
