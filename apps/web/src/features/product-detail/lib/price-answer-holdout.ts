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
 * 버킷은 서버 experimentBucket 과 같은 값 — sha256(`${실험id}:${기기id}`) 앞 4바이트 % 100. 앱(mobile)도 같은 함수.
 * ★진행 중인 실험 id 를 바꾸면 배정이 섞인다. 끄려면 PERCENT 를 0 으로(웹 태그·앱 OTA).
 */
export const PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID = 'price_answer_holdout_v1';
export const PRICE_ANSWER_HOLDOUT_PERCENT = 20;
export const PRICE_ANSWER_HOLDOUT_ATTR = 'data-answer-holdout';
/** 블록 쪽 표식 — 가격 답(HISTORY·MARKET) 블록에만 단다. globals.css 가 holdout 일 때 숨긴다. */
export const PRICE_ANSWER_ATTR = 'data-price-answer';
const DEVICE_ID_KEY = 'jirum-alarm-device-id';

export const isPriceAnswerKind = (kind: string | null | undefined) =>
  kind === 'HISTORY' || kind === 'MARKET';

/**
 * 기기 버킷 0~99 — 인라인 스크립트로 문자열이 되어 들어가므로 바깥 식별자를 하나도 쓰지 않는다(전부 안에 둔다).
 * 테스트가 이 함수를 그대로 불러 서버 값과 맞춰 본다.
 */
export function answerHoldoutBucket(unitId: string, experimentId: string): number {
  const text = `${experimentId}:${unitId}`;
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    let cp = text.charCodeAt(i);
    if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < text.length) {
      cp = 0x10000 + ((cp - 0xd800) << 10) + (text.charCodeAt(++i) - 0xdc00);
    }
    if (cp < 0x80) bytes.push(cp);
    else if (cp < 0x800) bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    else if (cp < 0x10000)
      bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    else
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
  }
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const len = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bits = len * 8;
  bytes.push(0, 0, 0, Math.floor(bits / 0x100000000) & 0xff);
  bytes.push((bits >>> 24) & 0xff, (bits >>> 16) & 0xff, (bits >>> 8) & 0xff, bits & 0xff);
  const h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  const w = new Array<number>(64);
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h[0];
    let b = h[1];
    let c = h[2];
    let d = h[3];
    let e = h[4];
    let f = h[5];
    let g = h[6];
    let hh = h[7];
    for (let i = 0; i < 64; i++) {
      const t1 =
        (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + k[i] + w[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }
  return h[0] % 100;
}

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
