/**
 * 토스 하루특가(토스 앱 「매일 밤 12시 선착순특가」) 카드 배지 — web·앱 카드가 같이 쓴다.
 *
 * crawler 가 product.data.toss 에 그날 창(todayDealStartAt/EndAt, KST 로컬시각 문자열 "2026-10-15T00:00:00"),
 * dealStatus(ON_GOING / TEMPORARILY_SOLD_OUT / SOLD_OUT), pageViewCount(앱 「N명이 봤어요」)를 남긴다.
 * 선착순 수량은 토스가 어디에도 주지 않아 마감 여부만 안다(2026-10-15 실측).
 * 배지 문구는 토스 앱 그대로 — 「선착순특가」 「하루만 N원」 「N만명이 봤어요」.
 */
export type TossTimeDealStatus = 'ON_SALE' | 'TEMPORARILY_SOLD_OUT' | 'SOLD_OUT';

export type TossTimeDeal = {
  status: TossTimeDealStatus;
  /** 사진 모서리 라벨. 판매 중 「선착순특가」, 마감이면 마감 문구. */
  label: string;
  /** 가격 앞 「하루만」. 판매 중일 때만. */
  pricePrefix?: string;
  /** 「2,125명이 봤어요」. 조회가 적으면(100 미만) 없다 — 몇 명 안 본 숫자는 신호가 아니라 소음이다. */
  viewCountText?: string;
};

/** KST 로컬시각 문자열. data.toss 의 창 시각과 같은 꼴이라 문자열 비교가 된다(서버 time-deal.logic 과 같다). */
export const kstLocalNow = (now: number = Date.now()): string =>
  new Date(now + 9 * 3_600_000).toISOString().slice(0, 19);

/** 토스 앱 표기: 1만 미만은 「2,125명」, 이상은 소수 한 자리 「1.2만명」(내림). */
export const formatTossViewCount = (count: number): string => {
  if (count >= 10_000) {
    const man = Math.floor(count / 1_000) / 10;
    return `${Number.isInteger(man) ? man : man.toFixed(1)}만명이 봤어요`;
  }
  return `${count.toLocaleString('ko-KR')}명이 봤어요`;
};

const MIN_VIEW_COUNT = 100;

/** 오늘 창 안의 토스 하루특가면 배지 정보, 아니면 null(지난 하루특가·일반 상품·커뮤니티 글). */
export function getTossTimeDeal(data: unknown, now: number = Date.now()): TossTimeDeal | null {
  const toss = (data as { toss?: unknown } | null | undefined)?.toss;
  if (!toss || typeof toss !== 'object') return null;
  const { todayDealStartAt, todayDealEndAt, dealStatus, pageViewCount } = toss as Record<
    string,
    unknown
  >;
  if (typeof todayDealStartAt !== 'string' || typeof todayDealEndAt !== 'string') return null;

  const t = kstLocalNow(now);
  if (t < todayDealStartAt.slice(0, 19) || t >= todayDealEndAt.slice(0, 19)) return null;

  const viewCountText =
    typeof pageViewCount === 'number' && pageViewCount >= MIN_VIEW_COUNT
      ? formatTossViewCount(pageViewCount)
      : undefined;

  if (dealStatus === 'SOLD_OUT') {
    return { status: 'SOLD_OUT', label: '선착순 마감', viewCountText };
  }
  if (dealStatus === 'TEMPORARILY_SOLD_OUT') {
    return { status: 'TEMPORARILY_SOLD_OUT', label: '일시품절', viewCountText };
  }
  return { status: 'ON_SALE', label: '선착순특가', pricePrefix: '하루만', viewCountText };
}
