// node --test 로 바로 돌리도록 경로 별칭(@/) import 없이 순수 함수로 둔다.

/** 어느 쇼핑몰에서나 추적용인 파라미터. 모르는 쇼핑몰엔 이것만 지운다(필요한 값을 지우지 않게). */
const TRACKING_PARAM = /^(utm_.*|fbclid|gclid|igshid|napm|spm|utparam-url)$/i;

/**
 * 상품 주소 모양이 확실한 쇼핑몰. keep 에 있는 파라미터만 남기고(대소문자 무시) 나머지는 지운다.
 * keep 이 비면 상품 id 가 경로에 있어 쿼리가 통째로 필요 없다는 뜻.
 * 각 모양은 운영 product.detailUrl 실링크에서 확인했다(2026-10-12).
 */
const PRODUCT_URL_RULES: { host: RegExp; path: RegExp; keep: string[] }[] = [
  {
    host: /^(www|m)\.coupang\.com$/,
    path: /^\/v[pm]\/products\/\d+/,
    keep: ['itemid', 'vendoritemid'],
  },
  { host: /^itempage3\.auction\.co\.kr$/, path: /^\/detailview\.aspx$/i, keep: ['itemno'] },
  { host: /^(m\.)?(smartstore|brand)\.naver\.com$/, path: /\/products\/\d+/, keep: [] },
  { host: /^(www|m)\.11st\.co\.kr$/, path: /^\/products\/\d+/, keep: [] },
  { host: /^store\.kakao\.com$/, path: /\/products\/\d+/, keep: [] },
];

/** 서버 getOriginalUrl 과 같은 표준 G마켓 상품 주소로 바꾼다. 상품 주소가 아니면 null. */
function canonicalGmarketUrl(url: URL): string | null {
  const host = url.hostname;
  if (host === 'item.gmarket.co.kr' || host === 'mitem.gmarket.co.kr') {
    const goodscode = url.searchParams.get('goodscode') ?? url.searchParams.get('goodsCode');
    if (goodscode) return `https://item.gmarket.co.kr/Item?goodscode=${goodscode}`;
  }
  if (host === 'm.gmarket.co.kr') {
    const match = url.pathname.match(/^\/vi\/product\/(\d+)/);
    if (match) return `https://item.gmarket.co.kr/Item?goodscode=${match[1]}`;
  }
  return null;
}

/**
 * 붙여넣은 구매 링크에서 추적용 파라미터를 걷어낸다. URL 이 아니면 그대로 돌려준다.
 * 검색 결과에서 복사한 G마켓 링크가 965자(utparam-url 덩어리)라 저장에 실패한 일이 있었다(2026-10-12).
 */
export function cleanProductUrl(raw: string): string {
  const trimmed = raw.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return raw;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return raw;

  const gmarket = canonicalGmarketUrl(url);
  if (gmarket) return gmarket;

  const rule = PRODUCT_URL_RULES.find(
    (r) => r.host.test(url.hostname) && r.path.test(url.pathname),
  );
  for (const key of [...url.searchParams.keys()]) {
    const drop = rule ? !rule.keep.includes(key.toLowerCase()) : TRACKING_PARAM.test(key);
    if (drop) url.searchParams.delete(key);
  }
  if (rule) url.hash = '';

  // 쿼리가 다 지워지면 URL 이 'https://…/item.html?' 처럼 빈 ? 를 남긴다.
  return url.toString().replace(/\?(?=#|$)/, '');
}
