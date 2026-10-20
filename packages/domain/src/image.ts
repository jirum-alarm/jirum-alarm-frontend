/**
 * CDN 이미지는 webp 로 요청한다 — cdn.jirum-alarm.com 은 webp 만 저장하는데 커뮤니티 본문·썸네일은 원본 확장자
 * (.jpg/.png)를 들고 온다(그 주소는 403). web·앱이 같은 규칙을 쓴다(2026-10-20 정본화).
 * 그 밖의 확장자·외부 썸네일(쿠팡·알리)은 건드리지 않는다.
 */
export const convertToWebp = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
};
