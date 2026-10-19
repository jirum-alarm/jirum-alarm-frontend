/**
 * 「답」 숨김 실험 `price_answer_holdout_v1`(2026-10-14, crawling-server experiment-registry).
 *
 * 질문: 상세 근거 블록의 가격 답(지난 핫딜 판정 HISTORY·다나와/쿠팡 시장가 MARKET — 「보통가보다 3,000원 싸요」)이
 * 구매 클릭을 늘리나. 가격추이 차트 숨김(price_history_holdout_v1)은 중간 판독에서 차이가 없었다 — 남은 질문이 이것이다.
 *
 * 웹 상세는 기기 구분 없는 캐시 SSR 이라 서버에서 숨길 수 없다. 그래서 첫 페인트 전에 도는 인라인 스크립트가
 * 기기 id(localStorage) 버킷을 계산해 <html data-answer-holdout="1"> 을 달고, CSS 가 가격 답 블록을 숨긴다 —
 * 깜빡임이 없고 HTML(검색 수집)엔 그대로 남는다. 기기 id 가 아직 없는 첫 방문은 대조로 보인다(분석은 버킷 기준 ITT).
 *
 * 배정 규칙(id·비율·버킷 해시)은 @jirum/domain price-answer-holdout·experiment-bucket — 앱과 같은 원본.
 * ★진행 중인 실험 id 를 바꾸면 배정이 섞인다. 끄려면 PERCENT 를 0 으로(웹 태그·앱 OTA).
 */
import { experimentBucket } from '@jirum/domain/experiment-bucket';
import {
  PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID,
  PRICE_ANSWER_HOLDOUT_PERCENT,
} from '@jirum/domain/price-answer-holdout';

export {
  isPriceAnswerKind,
  PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID,
  PRICE_ANSWER_HOLDOUT_PERCENT,
} from '@jirum/domain/price-answer-holdout';
/** 기기 버킷 0~99 — @jirum/domain experimentBucket(앱·서버와 같은 값). 인라인 스크립트에 toString() 으로 들어간다. */
export const answerHoldoutBucket = experimentBucket;
export const PRICE_ANSWER_HOLDOUT_ATTR = 'data-answer-holdout';
/** 블록 쪽 표식 — 가격 답(HISTORY·MARKET) 블록에만 단다. globals.css 가 holdout 일 때 숨긴다. */
export const PRICE_ANSWER_ATTR = 'data-price-answer';
const DEVICE_ID_KEY = 'jirum-alarm-device-id';

/** 첫 페인트 전 인라인 스크립트 — layout <head>. 실패는 조용히 대조. */
export const PRICE_ANSWER_HOLDOUT_SCRIPT = `(function(){try{var id=localStorage.getItem(${JSON.stringify(
  DEVICE_ID_KEY,
)});if(!id||${PRICE_ANSWER_HOLDOUT_PERCENT}<=0)return;var bucket=${answerHoldoutBucket.toString()};if(bucket(id,${JSON.stringify(
  PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID,
)})<${PRICE_ANSWER_HOLDOUT_PERCENT})document.documentElement.setAttribute(${JSON.stringify(
  PRICE_ANSWER_HOLDOUT_ATTR,
)},'1');}catch(e){}})();`;

/** 이 페이지가 holdout 으로 그려졌나 — 인라인 스크립트가 단 표식을 그대로 읽는다(노출 기록용). */
export function isPriceAnswerHoldoutPage(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute(PRICE_ANSWER_HOLDOUT_ATTR) === '1';
}
