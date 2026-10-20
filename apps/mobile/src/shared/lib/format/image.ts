/**
 * CDN 이미지 → webp — 정본 @jirum/domain/image(web 과 같은 규칙).
 * 변환본을 먼저 쓰고 실패하면 원본으로 되돌린다(Thumbnail·web ImageComponent fallbackSrc 와 같은 2단계) —
 * 폴백 없이 변환만 하면 애초에 webp 가 아닌 외부 이미지(쿠팡·알리 썸네일)를 깨뜨린다.
 */
export {convertToWebp} from '@jirum/domain/image';

/** 목록 썸네일을 받을 폭(px). 카드는 가장 커도 폰 반 폭(~170pt)이라 2배 화소로 충분하다. web next.config 의 imageSizes 에 있는 값이어야 한다. */
export const LIST_THUMBNAIL_WIDTH = 384;

/**
 * cdn 썸네일을 web 의 이미지 최적화(`/_next/image`)로 줄여 받는다 — 웹 카드가 쓰는 것과 같은 축소본.
 *
 * ★왜(2026-10-16): 앱은 목록에서도 원본 webp 를 받았다(실측 40~63KB, 같은 사진 384px 축소본은 18KB). 그리드·알림 목록을
 * 내리면 그만큼 데이터·디코딩 메모리·저사양 안드로이드 스크롤 버벅임이 쌓인다.
 * web 의 remotePatterns 가 cdn.jirum-alarm.com 만 허용하니 다른 호스트(쿠팡·알리)는 그대로 둔다.
 * 축소본이 실패하면 Thumbnail 이 원본으로 내려간다.
 */
export function optimizedThumbnailUrl(
  url: string | undefined,
  serviceUrl: string,
  width: number = LIST_THUMBNAIL_WIDTH,
): string | undefined {
  if (!url?.startsWith('https://cdn.jirum-alarm.com/')) return undefined;
  return `${serviceUrl}/_next/image?url=${encodeURIComponent(
    url,
  )}&w=${width}&q=75`;
}
