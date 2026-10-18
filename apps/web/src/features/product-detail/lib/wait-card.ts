/**
 * 상세 «언제 사나» 카드 A/B `wait_card_detail_v1`(crawling-server experiment-registry, 2026-11-05 00:00 KST 자동 시작).
 *
 * 무엇: 이 상품 키워드의 커뮤니티 90일 핫딜가로 본 «좋은 가격 X원 이하(90일 중 N일)» + 지금 판단 + 「이 가격 오면 알려줘」.
 * 배정·판정은 서버(waitCardForProduct, X-Device-Id) — 「답」 숨김 군은 excluded, 나머지 50/50. 대조군도 같은 카드를 받아
 * 그리지 않고 «떴을 카드»만 기록한다(판독은 카드가 뜰 수 있던 기기끼리 비교). 시작 전·꺼짐이면 서버가 null — 아무것도 안 한다.
 * 여기는 화면 문장과 기록 표식만 만든다(타입만 import — node --test 가 그대로 읽는다).
 */
import type { WaitCard } from '@/shared/api/product/product.service';

export type { WaitCard };

export type WaitCardVerdict = 'BUY_NOW' | 'WAIT' | 'RARE' | 'STATS';

const VERDICTS: readonly WaitCardVerdict[] = ['BUY_NOW', 'WAIT', 'RARE', 'STATS'];

/**
 * 그릴(대조군은 «그렸을») 판정 — 근거 블록에 가격 답(HISTORY·MARKET)이 있으면 «지금»은 그 블록 몫이라 카드는 기억만 말한다
 * (같은 상품 판정과 키워드 판정이 서로 다른 말을 하지 않게). 두 군에 같은 규칙이라 판독이 섞이지 않는다.
 */
export function shownVerdict(
  verdict: string | null,
  answerKind: string | null | undefined,
): WaitCardVerdict {
  const v = VERDICTS.includes(verdict as WaitCardVerdict) ? (verdict as WaitCardVerdict) : 'STATS';
  return answerKind === 'HISTORY' || answerKind === 'MARKET' ? 'STATS' : v;
}

/** 노출 기록 detail — card 군 `wait_card:<판정>`, 대조군 `wait_card_ctl:<판정>`, 그 밖(excluded·카드 없음)은 null. */
export function waitCardImpressionDetail(
  card: Pick<WaitCard, 'arm' | 'eligible'> | null,
  verdict: WaitCardVerdict,
): string | null {
  if (!card?.eligible) return null;
  if (card.arm === 'card') return `wait_card:${verdict}`;
  if (card.arm === 'control') return `wait_card_ctl:${verdict}`;
  return null;
}

const UNIT_PREFIX: Record<string, string> = {
  LITER: '1L당 ',
  HUNDRED_GRAM: '100g당 ',
  COUNT: '1개당 ',
};

/** 「1L당 390원」·「2,120,000원」·「액면가의 93%」 — 단위가는 원 단위로 반올림한다. */
export function formatUnitPrice(value: number, unit: string | null): string {
  if (unit === 'FACE_VALUE') return `액면가의 ${Math.round(value * 100)}%`;
  return `${UNIT_PREFIX[unit ?? ''] ?? ''}${Math.round(value).toLocaleString('ko-KR')}원`;
}

/** KST 기준 「10/14」. */
export function formatMonthDay(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const kst = new Date(t + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}/${kst.getUTCDate()}`;
}

/** 카드 두 줄 — 제목은 기억(좋은 가격), 둘째 줄은 얼마나 자주 + 지금 판단(또는 마지막 날). */
export function waitCardCopy(
  card: Pick<
    WaitCard,
    | 'keyword'
    | 'unit'
    | 'goodPrice'
    | 'goodDays'
    | 'windowDays'
    | 'typicalGapDays'
    | 'lastGoodAt'
    | 'pageUnitPrice'
  >,
  verdict: WaitCardVerdict,
): { title: string; detail: string } | null {
  if (!card.keyword || card.goodPrice == null || card.goodDays == null) return null;
  const good = formatUnitPrice(card.goodPrice, card.unit);
  const title = `‘${card.keyword}’ 좋은 가격은 ${good} 이하`;
  const days = `커뮤니티 핫딜 ${card.windowDays}일 중 ${card.goodDays}일`;
  const now =
    card.pageUnitPrice != null ? `지금 ${formatUnitPrice(card.pageUnitPrice, card.unit)}` : null;
  if (verdict === 'BUY_NOW' && now) return { title, detail: `${days} · ${now}, 좋은 가격이에요` };
  if (verdict === 'WAIT' && now) {
    const gap =
      card.typicalGapDays && card.typicalGapDays > 0
        ? `, 보통 ${card.typicalGapDays}일에 한 번 와요`
        : '';
    return { title, detail: `${days} · ${now}${gap}` };
  }
  if (verdict === 'RARE' && now) return { title, detail: `${days}뿐 · ${now}` };
  const last = formatMonthDay(card.lastGoodAt);
  return { title, detail: last ? `${days} · 마지막 ${last}` : days };
}

/** 등록 뒤 토스트 — 「‘삼다수’ 1L당 390원 이하일 때만 알려드릴게요」. */
export function waitWatchToast(card: Pick<WaitCard, 'keyword' | 'unit' | 'goodPrice'>): string {
  if (!card.keyword || card.goodPrice == null) return '알림을 걸었어요.';
  return `‘${card.keyword}’ ${formatUnitPrice(card.goodPrice, card.unit)} 이하일 때만 알려드릴게요`;
}
