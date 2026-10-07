import {
  formatPriceInput,
  parseExcludeKeywords,
  parsePrice,
  summarizeKeywordAlert,
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

  it('가격 입력칸은 쉼표를 찍어 보여준다', () => {
    expect(formatPriceInput('1000000')).toBe('1,000,000');
    expect(formatPriceInput('15,0000원')).toBe('150,000');
    expect(formatPriceInput('abc')).toBe('');
  });

  it('요약은 받을 딜·가격 범위·제외 단어를 말로 적는다(web 과 같은 문구)', () => {
    expect(
      summarizeKeywordAlert({
        priceDropOnly: false,
        excludeKeywords: [],
        minPrice: null,
        maxPrice: null,
      }),
    ).toBe('새 핫딜 모두');
    expect(
      summarizeKeywordAlert({
        priceDropOnly: true,
        excludeKeywords: ['케이스', '필름'],
        minPrice: null,
        maxPrice: 1000000,
      }),
    ).toBe('평소보다 쌀 때만 · 100만원 이하 · ‘케이스’ 외 1개 제외');
    expect(
      summarizeKeywordAlert({
        priceDropOnly: false,
        excludeKeywords: ['케이스'],
        minPrice: 100000,
        maxPrice: 200000,
      }),
    ).toBe('새 핫딜 모두 · 10만원~20만원 · ‘케이스’ 제외');
  });
});
