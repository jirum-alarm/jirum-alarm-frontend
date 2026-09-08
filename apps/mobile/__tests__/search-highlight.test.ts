export {};

/**
 * 제안어 강조. web `SearchAutocompleteDropdown.renderHighlighted` 와 같은 규칙
 * (첫 일치만, 대소문자 무시).
 *
 * ★정규식을 안 쓴다는 게 이 테스트의 본체다. web `HighlightText` 는
 * `new RegExp(keyword)` 라 `C++` 같은 검색어에서 SyntaxError 로 화면이 통째로
 * 흰색이 됐다(그래서 web 에 escapeRegExp 가 붙었다). 아래 대조군이 옛 방식이
 * 실제로 던지는 것을 재현한다 — 그게 이 구현의 계약이다.
 */

const {splitByPrefix} = require('../src/screens/search/lib/highlight');

const text = (parts: {text: string; match: boolean}[]) =>
  parts.map(p => p.text).join('');

describe('제안어 강조 분할', () => {
  it('일치 구간만 match: true 로 쪼갠다', () => {
    expect(splitByPrefix('아이폰 케이스', '아이폰')).toEqual([
      {text: '아이폰', match: true},
      {text: ' 케이스', match: false},
    ]);
  });

  it('가운데 일치도 세 토막으로 쪼갠다', () => {
    expect(splitByPrefix('무선 아이폰 충전기', '아이폰')).toEqual([
      {text: '무선 ', match: false},
      {text: '아이폰', match: true},
      {text: ' 충전기', match: false},
    ]);
  });

  it('대소문자를 무시하고 찾되 원문 글자를 그대로 보여준다', () => {
    const parts = splitByPrefix('MacBook Pro', 'macbook');
    expect(parts[0]).toEqual({text: 'MacBook', match: true});
    expect(text(parts)).toBe('MacBook Pro');
  });

  it('일치가 없으면 통째로 한 토막', () => {
    expect(splitByPrefix('라면', '쌀')).toEqual([{text: '라면', match: false}]);
  });

  it('빈 prefix 면 강조하지 않는다', () => {
    expect(splitByPrefix('라면', '  ')).toEqual([{text: '라면', match: false}]);
  });

  it('★정규식 메타문자가 있어도 죽지 않는다 (C++ · a.b · [1] · $)', () => {
    for (const keyword of ['C++', 'a.b', '[1]', '$', '(', '\\']) {
      const src = `${keyword} 어댑터`;
      const parts = splitByPrefix(src, keyword);
      expect(text(parts)).toBe(src);
      expect(parts[0]).toEqual({text: keyword, match: true});
    }
  });

  it('대조군 — 옛 정규식 방식은 같은 입력에서 실제로 던진다', () => {
    const oldWay = (src: string, keyword: string) =>
      src.split(new RegExp(`(${keyword})`, 'i'));
    expect(() => oldWay('C++ 어댑터', 'C++')).toThrow();
    // 던지지 않는 입력에서도 결과가 틀린다 — `.` 이 아무 글자에 맞아
    // 'axb' 를 'a.b' 의 일치로 강조한다. indexOf 는 그럴 수 없다.
    expect(oldWay('axb', 'a.b')).toContain('axb');
    expect(splitByPrefix('axb', 'a.b')).toEqual([{text: 'axb', match: false}]);
  });

  it('한 글자 한글 prefix(자동완성 최소 길이)도 동작한다', () => {
    expect(splitByPrefix('쌀 10kg', '쌀')).toEqual([
      {text: '쌀', match: true},
      {text: ' 10kg', match: false},
    ]);
  });
});
