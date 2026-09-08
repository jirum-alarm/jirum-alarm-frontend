/**
 * 커뮤니티 글 본문의 이미지 마커 파싱.
 *
 * 🔴 **정본은 web `apps/web/src/features/community/lib/postContent.ts` 다.**
 * `CommentOutput` 에 이미지 필드가 없어서 이미지 URL 을 본문 문자열 안
 * 마커 블록으로 저장한다. 즉 **저장 포맷이 곧 계약**이고, 한 글자라도 어긋나면
 * 이미 올라간 글의 이미지가 본문 텍스트로 새거나 통째로 사라진다.
 *
 * 포맷(그대로 유지할 것 — 개행 위치까지 포함):
 * ```
 * :::jirum-images
 * https://cdn.jirum-alarm.com/...
 * :::
 * 본문 텍스트
 * ```
 *
 * 앱은 **읽기만** 한다(쓰기 = web 웹뷰). 그래도 `serializePostContent` 를 같이
 * 옮겨둔 이유는 테스트에서 왕복(직렬화 → 파싱)으로 포맷을 못박기 위해서다 —
 * 읽기만 검사하면 web 이 포맷을 바꿔도 앱 테스트가 통과해버린다.
 *
 * ⚠️ 정규식·상수를 "개선"하지 말 것. web 과 같이 고쳐야 한다.
 */

const IMAGE_BLOCK_RE = /^:::jirum-images\n([\s\S]*?)\n:::\n?/;

const CDN_HOST = 'cdn.jirum-alarm.com';

export const MAX_POST_IMAGES = 5;

export function isAllowedPostImageUrl(url: string): boolean {
  // 🔴 web 은 `new URL(url).hostname` 으로 판정하지만 **RN 에서는 못 쓴다** —
  // React Native 의 URL 은 문자열을 들고만 있는 폴리필이라 `hostname` 게터가
  // 아예 없다(undefined). 그대로 옮기면 모든 이미지가 조용히 걸러져
  // 첨부가 통째로 안 보인다. 그래서 접두사 비교로 같은 판정을 만든다.
  //
  // ⚠️ 의도적으로 web 보다 **엄격**하다: 포트(`:443`)·userinfo(`user@`)가 붙은
  // 형태는 web 은 통과시키지만 여기서는 막는다. 업로더(`uploadProductImage`)가
  // 만드는 URL 은 항상 `https://cdn.jirum-alarm.com/...` 한 가지라 실물에는
  // 차이가 없고, 느슨하게 열어 `cdn.jirum-alarm.com.evil.com` 을 통과시키는
  // 쪽이 더 위험하다. 대소문자만 web 처럼 정규화한다.
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
