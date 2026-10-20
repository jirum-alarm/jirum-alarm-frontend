/**
 * 커뮤니티 글 본문의 이미지 마커 — 직렬화·파싱. web(글쓰기·목록·상세)과 앱(목록·상세)이 같이 쓴다.
 *
 * `CommentOutput` 에 이미지 필드가 없어 이미지 URL 을 본문 문자열 안 마커 블록으로 저장한다. **저장 포맷이 곧 계약**이라
 * 한 글자라도 어긋나면 이미 올라간 글의 이미지가 본문 텍스트로 새거나 통째로 사라진다. 그래서 정본은 여기 한 곳이다
 * (2026-10-20 — 전엔 web·앱이 따로 들고 앱 테스트가 web 파일의 정규식·상수를 문자열로 대조했다).
 *
 * 포맷(개행 위치까지 그대로):
 * ```
 * :::jirum-images
 * https://cdn.jirum-alarm.com/...
 * :::
 * 본문 텍스트
 * ```
 */

const IMAGE_BLOCK_RE = /^:::jirum-images\n([\s\S]*?)\n:::\n?/;

const CDN_HOST = 'cdn.jirum-alarm.com';

export const MAX_POST_IMAGES = 5;
export const MAX_POST_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_POST_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export function isAllowedPostImageUrl(url: string): boolean {
  // `new URL(url).hostname` 은 못 쓴다 — React Native 의 URL 폴리필엔 hostname 게터가 없어(undefined)
  // 모든 이미지가 조용히 걸러졌다. 접두사 비교로 판정한다. 포트(`:443`)·userinfo(`user@`)가 붙은 형태도 막는다 —
  // 업로더가 만드는 URL 은 늘 `https://cdn.jirum-alarm.com/...` 한 가지라 실물엔 차이가 없고,
  // `cdn.jirum-alarm.com.evil.com` 같은 걸 통과시키는 쪽이 더 위험하다. 대소문자는 URL 처럼 무시한다.
  const prefix = `https://${CDN_HOST}`;
  if (url.slice(0, prefix.length).toLowerCase() !== prefix) return false;
  const rest = url.slice(prefix.length);
  return rest === '' || rest.startsWith('/') || rest.startsWith('?');
}

export function parsePostContent(raw: string): {
  content: string;
  images: string[];
} {
  if (!raw) return {content: '', images: []};

  const match = raw.match(IMAGE_BLOCK_RE);
  if (!match) return {content: raw, images: []};

  const images = match[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && isAllowedPostImageUrl(line))
    .slice(0, MAX_POST_IMAGES);

  return {
    content: raw.slice(match[0].length),
    images,
  };
}

export function serializePostContent(
  content: string,
  images: string[],
): string {
  const text = content.trim();
  const safeImages = images
    .filter(isAllowedPostImageUrl)
    .slice(0, MAX_POST_IMAGES);

  if (safeImages.length === 0) return text;
  return `:::jirum-images\n${safeImages.join('\n')}\n:::\n${text}`;
}

/** 목록·미리보기에서 마커를 제외한 본문만. */
export function getPostDisplayContent(raw: string): string {
  return parsePostContent(raw).content;
}

export function getPostImages(raw: string): string[] {
  return parsePostContent(raw).images;
}
