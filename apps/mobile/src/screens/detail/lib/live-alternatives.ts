// 백포트(옛 runtime): main 은 @jirum/domain/live-alternatives — 이 브랜치엔 packages/domain 이 없어 같은 내용을 둔다.
/**
 * 진행 중 딜 상세의 「다른 곳 진행 중인 딜」 블록 제목·줄별 값 차이 표기 — web·앱이 같은 문장을 쓰게 여기 한 곳.
 * 후보를 고르고 값 차이(priceDiff)를 재는 건 서버(crawling live-alternative-deals.logic), 여기는 그걸 어떻게 말할지만 정한다.
 */

export type LiveAlternativeSummaryInput = {
  /** same=같은 상품(다른 곳·다른 값), related=같은 라인(용량·구성·색이 다름) */
  kind: string;
  /** 이 딜 값 − 지금 보는 딜 값(원). 같은 상품·원화끼리만 있고 아니면 null */
  priceDiff?: number | null;
};

export type LiveAlternativeSummary = {title: string; subtitle: string};

export const formatWon = (n: number): string =>
  `${Math.round(n).toLocaleString('ko-KR')}원`;

/** 줄 값 옆 차이 표기. 싸면 강조(저가=error 색), 비싸면 회색. 차이가 없거나 모르면 null. */
export function formatPriceDiff(
  diff: number | null | undefined,
): {text: string; cheaper: boolean} | null {
  if (diff === null || diff === undefined || diff === 0) return null;
  return diff < 0
    ? {text: `${formatWon(-diff)} 더 싸요`, cheaper: true}
    : {text: `+${formatWon(diff)}`, cheaper: false};
}

export function liveAlternativeKindLabel(kind: string): string {
  return kind === 'same' ? '같은 상품' : '비슷한 상품';
}

export function summarizeLiveAlternatives(
  deals: LiveAlternativeSummaryInput[],
): LiveAlternativeSummary {
  const diffs = deals
    .map(d => d.priceDiff)
    .filter((d): d is number => typeof d === 'number' && d !== 0);
  const bestSaving = Math.max(0, ...diffs.map(d => -d));

  if (bestSaving > 0) {
    return {
      title: '같은 상품이 더 싸게 올라왔어요',
      subtitle: `지금 진행 중인 딜 중 최대 ${formatWon(bestSaving)} 더 싸요`,
    };
  }
  if (diffs.length > 0) {
    return {
      title: '지금 보는 딜이 더 싸요',
      subtitle: '같은 상품의 다른 진행 중 딜과 비교했어요',
    };
  }
  if (deals.some(d => d.kind === 'same')) {
    return {
      title: '같은 상품, 다른 곳에서도 진행 중',
      subtitle: '판매처·조건을 비교해 보세요',
    };
  }
  return {
    title: '비슷한 상품도 진행 중이에요',
    subtitle: '용량·구성이 다른 같은 라인 딜이에요',
  };
}
