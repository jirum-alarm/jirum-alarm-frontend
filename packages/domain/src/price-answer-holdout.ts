/**
 * 「답」 숨김 실험 `price_answer_holdout_v1`(2026-10-14, crawling-server experiment-registry) — web·앱 공용 배정 규칙.
 *
 * 숨김 군 기기는 상세 근거 블록의 가격 답(지난 핫딜 판정 HISTORY·시장가 MARKET)을 안 본다.
 * 버킷 = experimentBucket(기기id, PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID)(서버와 같은 값). 버킷 < PERCENT 면 숨김.
 * 표시 방법(web 인라인 스크립트+CSS, 앱 훅)은 각 앱에 둔다.
 * ★진행 중인 실험 id 를 바꾸면 배정이 섞인다. 끄려면 PERCENT 를 0 으로(웹 태그·앱 OTA).
 */
export const PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID = 'price_answer_holdout_v1';
export const PRICE_ANSWER_HOLDOUT_PERCENT = 20;

export const isPriceAnswerKind = (kind: string | null | undefined) =>
  kind === 'HISTORY' || kind === 'MARKET';

/** 버킷(0~99) → 숨김 군인가. 버킷이 없으면(기기 id 없음) 대조. */
export function isPriceAnswerHoldoutBucket(
  bucket: number | null,
  percent: number = PRICE_ANSWER_HOLDOUT_PERCENT,
): boolean {
  return bucket !== null && percent > 0 && bucket < percent;
}
