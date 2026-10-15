import type { WaitEstimate, WaitUnit } from './types.ts';

/**
 * 「언제 사나」 화면 문구 — 숫자를 사람 말로. 판정은 서버가 하고 여기는 말만 고른다.
 * ★정직성 경계: confident=false(여러 상품이 섞임)·카테고리면 단정하지 않는다 — 8월 AI 챗에서
 * 「HIGH 신뢰 0.7%」인 판정을 확신처럼 팔 뻔했다(메모리 ai-app-position-computed-but-never-wired).
 */

const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;

/** 단위가 한 줄: 「1L당 410원」·「액면가의 92%」·「289,000원」. */
export const unitPriceText = (unit: WaitUnit, v: number): string => {
  switch (unit) {
    case 'LITER':
      return `1L당 ${won(v)}`;
    case 'HUNDRED_GRAM':
      return `100g당 ${won(v)}`;
    case 'COUNT':
      return `1개당 ${won(v)}`;
    case 'FACE_VALUE':
      return `액면가의 ${Math.round(v * 100)}%`;
    default:
      return won(v);
  }
};

/** 축 눈금처럼 짧게: 「410원」·「92%」·「29만」. */
export const unitPriceShort = (unit: WaitUnit, v: number): string => {
  if (unit === 'FACE_VALUE') return `${Math.round(v * 100)}%`;
  if (v >= 10_000) return `${(v / 10_000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만`;
  return `${Math.round(v).toLocaleString('ko-KR')}원`;
};

export type Headline = { tone: 'buy' | 'wait' | 'rare' | 'unknown'; title: string; sub: string };

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (iso: string, now: number) =>
  Math.max(0, Math.floor((now - Date.parse(iso)) / DAY_MS));
const agoText = (n: number) => (n === 0 ? '오늘' : n === 1 ? '어제' : `${n}일 전`);

/** 판정 한 줄 + 근거 한 줄. */
export const headline = (e: WaitEstimate, now = Date.now()): Headline => {
  if (e.kind === 'CATEGORY') {
    return {
      tone: 'unknown',
      title: '어떤 상품인지 조금만 더 알려 주세요',
      sub: `「${e.label}」은 값이 서로 다른 상품이 많아 가격 하나로 말할 수 없어요. 모델명이나 용량을 붙여 보세요.`,
    };
  }
  if (e.verdict === 'NO_DATA' || e.goodPrice == null) {
    return {
      tone: 'unknown',
      title: '아직 판단할 만큼 딜이 없어요',
      sub:
        e.dealCount > 0
          ? `최근 ${e.windowDays}일 동안 ${e.dealCount}건뿐이었어요. 알림을 걸어 두면 뜰 때 바로 알려 드려요.`
          : `최근 ${e.windowDays}일 동안 핫딜이 없었어요. 알림을 걸어 두면 뜰 때 바로 알려 드려요.`,
    };
  }

  const good = unitPriceText(e.unit, e.goodPrice);
  const freq =
    e.typicalGapDays != null && e.goodDays >= 2
      ? `보통 ${e.typicalGapDays}일 간격으로 와요`
      : `${e.windowDays}일 동안 ${e.goodDays}일 있었어요`;
  const last = e.lastGoodAt ? ` · 마지막 ${agoText(daysAgo(e.lastGoodAt, now))}` : '';
  const hedge = e.confident ? '' : ' (여러 상품이 섞여 있을 수 있어요)';

  if (e.verdict === 'BUY_NOW' && e.current) {
    return {
      tone: 'buy',
      title: '지금 사도 좋아요',
      sub: `지금 ${unitPriceText(e.unit, e.current.unitPrice)} — 좋은 가격(${good} 이하)이에요. ${freq}${hedge}`,
    };
  }
  if (e.verdict === 'WAIT') {
    // 남은 날 = 보통 간격 − 마지막 뒤 지난 날. 간격을 그대로 말하면 「마지막 5일 전·보통 7일 간격」에 「7일 기다려」가 된다.
    const since = e.lastGoodAt ? daysAgo(e.lastGoodAt, now) : null;
    const left = e.typicalGapDays != null && since != null ? e.typicalGapDays - since : null;
    return {
      tone: 'wait',
      title:
        left == null
          ? '조금 기다려 보세요'
          : left > 0
            ? `${left}일쯤 더 기다려 보세요`
            : '좋은 가격이 올 때가 됐어요',
      sub: `${good} 이하가 ${e.windowDays}일 중 ${e.goodDays}일 떴어요. ${freq}${last}${hedge}`,
    };
  }
  return {
    tone: 'rare',
    title: '좋은 가격은 자주 안 와요',
    sub: `${good} 이하는 ${e.windowDays}일 동안 ${e.goodDays}일뿐이었어요${last}. 급하지 않으면 알림을 걸어 두세요${hedge}.`,
  };
};

/**
 * 「이 가격 오면 알려줘」 아래 한 줄 — 무엇이 오고 무엇이 안 오는지. 조건 자체는 서버(addWaitWatch)가 판정을 다시 내 건다:
 * 좋은 가격을 말할 수 있으면 「하락만 받기」 + 단위 기준가(그 이하 딜만), 아니면 가격 조건 없는 새 딜 알림.
 */
export const watchNote = (e: WaitEstimate): string =>
  hasPriceVerdict(e)
    ? `${unitPriceText(e.unit, e.goodPrice!)} 이하 「${e.keyword}」 딜만 알려 드려요 — 지난 ${e.windowDays}일이면 ${e.goodDealCount}번(키워드만 걸면 약 ${e.rawMatchCount}번)`
    : `「${e.keyword}」 새 딜마다 알려 드려요(지난 ${e.windowDays}일 약 ${e.rawMatchCount}번)`;

/** 「좋은 가격」을 말해도 되는가 — 카테고리가 아니고 같은 물건끼리 비교 중일 때만. */
export const hasPriceVerdict = (e: WaitEstimate) =>
  e.kind !== 'CATEGORY' && e.confident && e.goodPrice != null;
