const {parsePrice, displayTime} = require('../src/shared/lib/format/price');

describe('parsePrice — web 과 표기가 갈리면 같은 상품이 다르게 보인다', () => {
  it('정형 가격', () => {
    expect(parsePrice('12,900원')).toEqual({
      hasWon: true,
      priceWithoutWon: '12,900',
    });
    expect(parsePrice('12900')).toEqual({
      hasWon: true,
      priceWithoutWon: '12,900',
    });
    expect(parsePrice(12900)).toEqual({
      hasWon: true,
      priceWithoutWon: '12,900',
    });
  });

  it('빈 값은 "커뮤니티 확인"', () => {
    for (const v of [null, undefined, '']) {
      expect(parsePrice(v)).toEqual({
        hasWon: false,
        priceWithoutWon: '커뮤니티 확인',
      });
    }
  });

  // 옛 web 구현이 "￦ 8,780 (KRW)원" 처럼 원을 덧붙였던 회귀.
  it('비정형에서 원이 덧붙지 않는다', () => {
    expect(parsePrice('￦ 8,780원 (KRW)')).toEqual({
      hasWon: true,
      priceWithoutWon: '8,780',
    });
    expect(parsePrice('삼성카드46,080')).toEqual({
      hasWon: true,
      priceWithoutWon: '46,080',
    });
    expect(parsePrice('24,963원부터')).toEqual({
      hasWon: true,
      priceWithoutWon: '24,963',
    });
  });

  it('외화는 원을 붙이지 않고 원문 유지', () => {
    expect(parsePrice('$ 2.67 (USD)')).toEqual({
      hasWon: false,
      priceWithoutWon: '$ 2.67 (USD)',
    });
  });

  it('숫자가 없으면 가격이 아니다', () => {
    expect(parsePrice('선택')).toEqual({
      hasWon: false,
      priceWithoutWon: '선택',
    });
  });
});

describe('displayTime', () => {
  const ago = (sec: number) => new Date(Date.now() - sec * 1000);

  it('구간별 표기', () => {
    expect(displayTime(ago(30))).toBe('방금 전');
    expect(displayTime(ago(60 * 5))).toBe('방금 전');
    expect(displayTime(ago(60 * 35))).toBe('30분 전');
    expect(displayTime(ago(3600 * 5))).toBe('5시간 전');
    expect(displayTime(ago(86400 * 3))).toBe('3일 전');
    expect(displayTime(ago(86400 * 14))).toBe('2주 전');
  });

  it('잘못된 입력은 빈 문자열', () => {
    expect(displayTime(null)).toBe('');
    expect(displayTime('not-a-date')).toBe('');
  });

  // 미래 시각이 오면 음수 초가 되어 "-1시간 전" 같은 표기가 나올 수 있다.
  it('미래 시각도 깨지지 않는다', () => {
    expect(displayTime(new Date(Date.now() + 60_000))).toBe('방금 전');
  });
});
