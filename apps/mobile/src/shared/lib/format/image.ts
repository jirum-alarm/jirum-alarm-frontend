/**
 * CDN 이미지 URL 을 webp 로 바꾼다. web `shared/lib/utils/image.ts` 와 같은 규칙.
 *
 * 🔴이게 없어서 앱이 이미지를 못 그렸다. `cdn.jirum-alarm.com` 은 **webp 만**
 * 저장하는데 커뮤니티 글 본문 마커·썸네일은 **원본 확장자**(.jpg/.png)를 들고
 * 온다. 그 URL 은 403 이 오고(S3 에 ListBucket 권한이 없어 404 대신 403),
 * `<Image>` 는 아무것도 안 그려 **빈 회색 상자**가 남는다.
 *
 * 실측(2026-09-09, 최근 글 32건에서 뽑은 cdn URL 29개):
 *   원본 확장자 26건 전부 403 → 같은 경로의 `.webp` 는 전부 200.
 *   시뮬레이터 로그의 403 이 3시간에 274건이었던 것도 이 때문이다.
 *
 * web 은 변환본을 먼저 쓰고 실패하면 원본으로 되돌린다(`ImageComponent` 의
 * `fallbackSrc`) — 앱도 같은 2단계로 간다. 변환만 하고 폴백이 없으면 애초에
 * webp 가 아닌 외부 이미지(쿠팡·알리 썸네일)를 깨뜨린다.
 */
export function convertToWebp(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
}
