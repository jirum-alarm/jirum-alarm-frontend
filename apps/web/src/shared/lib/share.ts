export type ShareChannel = 'kakao' | 'x' | 'threads' | 'copy' | 'native';

/**
 * 공유 URL. 유입 시 붙어 온 utm 이 재공유로 전파되면 채널 귀속이 오염되므로
 * 기존 utm 을 제거하고 채널별 utm 으로 교체한다(2026-07-20 규칙 유지).
 */
export const buildShareUrl = (href: string, channel: ShareChannel): string => {
  const url = new URL(href);
  [...url.searchParams.keys()]
    .filter((k) => k.startsWith('utm_'))
    .forEach((k) => url.searchParams.delete(k));
  url.searchParams.set('utm_source', 'share');
  url.searchParams.set('utm_medium', channel === 'native' ? 'native_share' : channel);
  return url.toString();
};

/**
 * 카톡 등은 미리보기(OG)를 늘 보여주지 않아 링크만 오면 뭘 받았는지 모른다.
 * 링크는 항상 마지막 줄 — 그래야 URL 을 미리보기로 잡는다.
 */
export const buildShareMessage = (title: string, url: string, description?: string): string =>
  description ? `${title}\n${description}\n${url}` : `${title}\n${url}`;

/**
 * SNS intent URL. `caption` 은 링크를 뺀 본문(제목·설명)이어야 한다 —
 * x 는 url 을 별도 파라미터로 받으므로 본문에 링크가 있으면 두 번 들어간다.
 */
export const buildIntentUrl = (channel: 'x' | 'threads', caption: string, url: string): string => {
  if (channel === 'x') {
    // x 는 text 와 url 을 분리해 받는다(url 은 t.co 로 축약되며 글자수에서 제외).
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(url)}`;
  }
  // 스레드는 url 파라미터가 없어 본문에 합쳐 넣는다.
  return `https://www.threads.net/intent/post?text=${encodeURIComponent(`${caption}\n${url}`)}`;
};

/** 링크를 제외한 본문(제목 + 설명). intent 의 caption 용. */
export const buildCaption = (title: string, description?: string): string =>
  description ? `${title}\n${description}` : title;
