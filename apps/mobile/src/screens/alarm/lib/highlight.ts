/**
 * 메시지를 키워드 기준으로 쪼갠다. 강조할 조각은 `match: true`.
 *
 * ★web(`HighlightText`)은 `new RegExp` 로 split 하기 때문에 키워드에 정규식
 * 메타문자가 있으면 SyntaxError 로 알림 화면이 통째로 흰화면이 됐다
 * (그래서 web 에는 `escapeRegExp` 가 붙어 있다). 여기서는 indexOf 로 자르므로
 * 이스케이프가 필요 없고 그 버그 자체가 성립하지 않는다.
 *
 * ponytail: 문자열 분할이면 충분한 자리에 정규식을 쓰지 않는다.
 */
export function splitByKeyword(
  message: string,
  keyword: string,
): {text: string; match: boolean}[] {
  if (!keyword) return [{text: message, match: false}];

  const parts: {text: string; match: boolean}[] = [];
  let rest = message;

  for (;;) {
    const at = rest.indexOf(keyword);
    if (at === -1) break;
    if (at > 0) parts.push({text: rest.slice(0, at), match: false});
    parts.push({text: keyword, match: true});
    rest = rest.slice(at + keyword.length);
  }
  if (rest) parts.push({text: rest, match: false});

  return parts;
}

/** web: 강조는 키워드의 **첫 단어**만 (`keyword?.split(' ')[0]`). */
export function firstKeyword(keyword?: string | null): string {
  return keyword?.split(' ')[0] ?? '';
}
