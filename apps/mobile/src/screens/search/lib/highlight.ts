/**
 * 제안어에서 입력 prefix 와 겹치는 부분을 찾아 세 토막으로 쪼갠다.
 * web: SearchAutocompleteDropdown 의 `renderHighlighted`
 * (첫 번째 일치만 굵게 — 여기서도 같다).
 *
 * ★정규식을 쓰지 않는다. web `HighlightText` 는 `new RegExp` 라 검색어가
 * `C++` 이면 SyntaxError 로 화면이 흰색이 됐고(그래서 web 에 `escapeRegExp` 가
 * 붙었다), 알림 탭도 같은 이유로 indexOf 분할로 옮겼다
 * (screens/alarm/lib/highlight.ts). 대소문자만 무시하면 되므로 이 정도면 충분하다.
 *
 * ponytail: 문자열 분할이면 충분한 자리에 정규식을 쓰지 않는다 —
 * 안 쓰면 이스케이프 버그가 성립조차 하지 않는다.
 */
export function splitByPrefix(
  text: string,
  prefix: string,
): {text: string; match: boolean}[] {
  const needle = prefix.trim().toLowerCase();
  if (!needle) return [{text, match: false}];

  const at = text.toLowerCase().indexOf(needle);
  if (at < 0) return [{text, match: false}];

  const parts: {text: string; match: boolean}[] = [];
  if (at > 0) parts.push({text: text.slice(0, at), match: false});
  parts.push({text: text.slice(at, at + needle.length), match: true});
  const rest = text.slice(at + needle.length);
  if (rest) parts.push({text: rest, match: false});
  return parts;
}
