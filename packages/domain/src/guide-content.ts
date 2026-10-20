/**
 * 상세 정보 표 가이드 행(가격·구매 조건·쿠폰…)의 글을 글자 조각과 링크 조각으로 나눈다 — web·앱이 같은 규칙으로 쓴다.
 * 예전엔 URL 을 지워 버려(plainGuideContent) 「쿠폰 받기」 링크가 글자로만 남아 눌러도 아무 일이 없었다
 * (Clarity dead click, 2026-10-20).
 *
 * 링크로 살리는 건 http(s) 주소뿐이다 — `javascript:`·`data:` 같은 주소는 링크로 만들지 않는다
 * (마크다운 링크면 라벨만 남긴다). 글자는 React 가 이스케이프하므로 여기선 href 만 거르면 된다.
 */
export type GuideSegment =
  { type: 'text'; text: string } | { type: 'link'; href: string; label: string };

// [라벨](주소 — 괄호 한 겹까지) 또는 맨 주소. 맨 주소는 공백·꺾쇠·따옴표 전까지.
const TOKEN = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)|(https?:\/\/[^\s<>"']+)/g;
// 맨 주소 끝에 붙은 문장부호는 주소가 아니다(「…/coupon.」 「(https://a.com)」).
const TRAILING = /[.,!?;:)\]}>'"’”]+$/;
// 링크로 쓸 수 있는 주소 — http(s) + 호스트, 속성을 깰 수 있는 글자(따옴표·꺾쇠·공백) 없음.
// URL 생성자를 쓰지 않는다: 앱(React Native)의 URL 은 hostname 등이 구현돼 있지 않다.
const SAFE_HREF = /^https?:\/\/([^/?#\s<>"':@]+)(?::\d+)?(?:[/?#][^\s<>"']*)?$/i;

function safeHref(raw: string): string | null {
  return SAFE_HREF.test(raw) ? raw : null;
}

function linkLabel(href: string): string {
  return (href.match(SAFE_HREF)?.[1] ?? href).replace(/^www\./i, '');
}

export function parseGuideContent(content: string): GuideSegment[] {
  const out: GuideSegment[] = [];
  const pushText = (text: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last?.type === 'text') last.text += text;
    else out.push({ type: 'text', text });
  };

  let at = 0;
  for (const m of content.matchAll(TOKEN)) {
    pushText(content.slice(at, m.index));
    at = m.index + m[0].length;
    if (m[1] !== undefined) {
      // 마크다운 링크 — 주소가 안전하지 않으면 라벨만 글자로.
      const href = safeHref(m[2]);
      if (href) out.push({ type: 'link', href, label: m[1] });
      else pushText(m[1]);
      continue;
    }
    const raw = m[3];
    const trail = raw.match(TRAILING)?.[0] ?? '';
    const href = safeHref(raw.slice(0, raw.length - trail.length));
    if (href) out.push({ type: 'link', href, label: linkLabel(href) });
    pushText(trail);
  }
  pushText(content.slice(at));

  // 공백 정리 — 줄바꿈·연속 공백을 한 칸으로(표 한 칸 안이라), 양 끝은 다듬는다.
  for (const s of out) if (s.type === 'text') s.text = s.text.replace(/\s+/g, ' ');
  const first = out[0];
  if (first?.type === 'text') first.text = first.text.trimStart();
  const last = out[out.length - 1];
  if (last?.type === 'text') last.text = last.text.trimEnd();
  return out.filter((s) => s.type === 'link' || s.text.length > 0);
}
