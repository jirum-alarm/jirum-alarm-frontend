/**
 * 공유 카드(카톡·X·스레드 미리보기 이미지)에 무엇을 적을지. 그리는 건 `app/api/og/product/[id]/route.tsx`.
 *
 * 카톡 카드는 og:image 한 장이 화면의 대부분이다. 상품 사진만 있으면 받은 사람이 가격도, 왜 핫딜인지도
 * 모른 채 눌러야 한다 — 그래서 사진 옆에 배지·가격·쇼핑몰을 얹는다. 이 파일은 노드 테스트가 바로 읽도록
 * import 가 없다(배지 이름은 호출부가 `hotdealTextMap` 으로 넘긴다).
 */

export type ShareCardInput = {
  title: string;
  price?: string | null;
  mallName?: string | null;
  /** 핫딜·대박딜·초대박딜. 배지 없는 딜은 비운다. */
  badge?: string | null;
  isEnd?: boolean | null;
  /** 토스 코너 유입(`from=toss`)은 가격을 노출하지 않는다 — 상세와 같은 규칙. */
  hidePrice?: boolean;
};

export type ShareCard = {
  title: string;
  price: string | null;
  mallName: string | null;
  badge: string | null;
  ended: boolean;
};

/** 두 줄에 들어가는 길이. 그리는 쪽도 lineClamp 로 자르지만, 긴 제목은 글자 배치 비용부터 줄인다. */
export const SHARE_CARD_TITLE_MAX = 60;

// 커뮤니티 제목 끝에 붙는 가격("… 3,910원")은 카드에 가격을 크게 따로 쓰므로 뗀다.
// from-toss 의 stripPriceFromTitle 과 같은 규칙이지만, 그 모듈은 alias import 를 써서 노드 테스트가 못 읽는다.
const stripTrailingPrice = (title: string): string =>
  title
    .replace(/\s*\d+(?:g|ml|kg|l|개|매|롤|포|장|입)?당\s*\d{1,3}(?:,\d{3})*원/gi, '')
    .replace(/\s*\d{1,3}(?:,\d{3})+원/g, '')
    .replace(/\s*\d{4,}원/g, '')
    .replace(/[\s,·|/]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

export const buildShareCard = ({
  title,
  price,
  mallName,
  badge,
  isEnd,
  hidePrice,
}: ShareCardInput): ShareCard => {
  const cleaned = stripTrailingPrice(title) || title.trim();
  const clipped =
    cleaned.length > SHARE_CARD_TITLE_MAX
      ? `${cleaned.slice(0, SHARE_CARD_TITLE_MAX - 1).trimEnd()}…`
      : cleaned;
  // 가격 칸이 "가격정보 없음"·"0원" 처럼 숫자가 없으면 크게 쓸 값이 아니다.
  const priceText = price?.trim() ?? '';
  return {
    title: clipped,
    price: !hidePrice && /\d/.test(priceText) ? priceText : null,
    mallName: mallName?.trim() || null,
    badge: badge?.trim() || null,
    ended: !!isEnd,
  };
};

/** 공유 링크로 들어온 요청인가 — 두 플랫폼 buildShareUrl 이 늘 utm_source=share 를 붙인다. */
export const isShareRequest = (utmSource: string | string[] | null | undefined): boolean =>
  (Array.isArray(utmSource) ? utmSource[0] : utmSource) === 'share';

/**
 * 공유 문구의 둘째 줄(복사·OS 시트·시트 미리보기) — "대박딜 · 58,170원 · 지마켓".
 * 카드 이미지가 안 뜨는 곳(문자·카톡 링크 미리보기 꺼짐)에서도 왜 보냈는지 읽히게 배지를 앞에 둔다.
 * 종료된 딜은 배지를 빼고 "판매종료"를 붙인다 — 상세도 종료되면 배지 뜻을 숨긴다. 앱 share.ts 와 같은 규칙.
 */
export const buildProductShareDescription = ({
  price,
  mallName,
  badge,
  isEnd,
  hidePrice,
}: Omit<ShareCardInput, 'title'>): string | undefined =>
  [isEnd ? '판매종료' : badge, hidePrice ? null : price, mallName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' · ') || undefined;
