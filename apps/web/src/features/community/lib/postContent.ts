/**
 * 커뮤니티 게시글 본문에 이미지를 임베드하기 위한 직렬화/파싱.
 * CommentOutput 에 이미지 필드가 없어 content 문자열에 마커 블록으로 저장한다.
 *
 * 포맷:
 * :::jirum-images
 * https://cdn.jirum-alarm.com/...
 * :::
 * 본문 텍스트
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
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === CDN_HOST;
  } catch {
    return false;
  }
}

export function parsePostContent(raw: string): { content: string; images: string[] } {
  if (!raw) return { content: '', images: [] };

  const match = raw.match(IMAGE_BLOCK_RE);
  if (!match) return { content: raw, images: [] };

  const images = match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && isAllowedPostImageUrl(line))
    .slice(0, MAX_POST_IMAGES);

  return {
    content: raw.slice(match[0].length),
    images,
  };
}

export function serializePostContent(content: string, images: string[]): string {
  const text = content.trim();
  const safeImages = images.filter(isAllowedPostImageUrl).slice(0, MAX_POST_IMAGES);

  if (safeImages.length === 0) return text;
  return `:::jirum-images\n${safeImages.join('\n')}\n:::\n${text}`;
}

/** 목록/OG 등에서 마커를 제외한 본문만 보여줄 때 사용 */
export function getPostDisplayContent(raw: string): string {
  return parsePostContent(raw).content;
}

export function getPostImages(raw: string): string[] {
  return parsePostContent(raw).images;
}
