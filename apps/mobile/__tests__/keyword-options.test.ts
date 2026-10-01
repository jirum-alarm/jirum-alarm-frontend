import {
  parseExcludeKeywords,
  parsePrice,
  summarizeKeywordOptions,
} from '@/features/mypage/lib/keyword-options';

describe('키워드 알림 조건 파싱 — web keyword-options 와 같은 규칙', () => {
  it('제외 단어는 쉼표로 나누고 공백·빈칸·중복을 정리한다', () => {
    expect(parseExcludeKeywords(' 콜라겐, 콜라보 ,,콜라겐 ')).toEqual([
      '콜라겐',
      '콜라보',
    ]);
  });

  it('제외 단어는 최대 10개, 단어당 20자(서버 검증과 같다)', () => {
    const many = Array.from({length: 12}, (_, i) => `단어${i}`).join(',');
    expect(parseExcludeKeywords(many)).toHaveLength(10);
    expect(parseExcludeKeywords('가'.repeat(25))[0]).toHaveLength(20);
  });

  it('가격은 숫자만 남겨 원 단위로, 비면 null', () => {
    expect(parsePrice('1,000,000원')).toBe(1000000);
    expect(parsePrice('  ')).toBeNull();
  });

  it('요약은 가격 범위와 제외 개수를 보여준다', () => {
    expect(
      summarizeKeywordOptions({
        excludeKeywords: ['a', 'b'],
        minPrice: null,
        maxPrice: 1500000,
      }),
    ).toBe('~150만원 · 제외 2');
    expect(
      summarizeKeywordOptions({
        excludeKeywords: [],
        minPrice: null,
        maxPrice: null,
      }),
    ).toBe('');
  });
});
