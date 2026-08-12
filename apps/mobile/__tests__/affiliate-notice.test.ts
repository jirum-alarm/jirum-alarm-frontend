export {};

/**
 * 제휴 고지는 장식이 아니라 제휴 표시 의무 대응이다.
 * 웹은 모든 상품에 둘 중 하나를 상호배타로 띄운다 — 하나도 안 뜨거나
 * 둘 다 뜨면 결함이다.
 */
function isCoupangPartner(mallName?: string | null): boolean {
  if (!mallName) return false;
  return mallName.includes('쿠팡') || mallName.includes('coupang');
}

/** 화면이 실제로 쓰는 분기와 같은 규칙. */
function shown(mallName?: string | null) {
  const coupang = isCoupangPartner(mallName);
  return {
    coupangNotice: coupang,
    generalNotice: !coupang,
  };
}

describe('제휴 고지 — 항상 정확히 하나', () => {
  const CASES = [
    '쿠팡',
    '쿠팡이츠',
    'coupang',
    '롯데온',
    '알리',
    '지마켓',
    null,
    undefined,
    '',
  ];

  it.each(CASES)('mallName=%s 이면 고지가 정확히 하나 뜬다', mall => {
    const s = shown(mall);
    const count = Number(s.coupangNotice) + Number(s.generalNotice);
    expect(count).toBe(1);
  });

  it('쿠팡 계열은 쿠팡 문구만', () => {
    expect(shown('쿠팡')).toEqual({coupangNotice: true, generalNotice: false});
    expect(shown('coupang')).toEqual({
      coupangNotice: true,
      generalNotice: false,
    });
  });

  // mallName 이 비어도 고지는 떠야 한다 — 제휴 링크일 수 있다.
  it('몰 이름이 없어도 일반 고지는 뜬다', () => {
    expect(shown(null)).toEqual({coupangNotice: false, generalNotice: true});
    expect(shown('')).toEqual({coupangNotice: false, generalNotice: true});
  });

  it('비쿠팡은 일반 문구만', () => {
    expect(shown('롯데온')).toEqual({
      coupangNotice: false,
      generalNotice: true,
    });
  });
});

describe('화면 코드가 같은 규칙을 쓴다', () => {
  it('AffiliateNotice 가 상호배타 분기를 유지한다', () => {
    const src: string = require('fs').readFileSync(
      'src/screens/detail/ui/AffiliateNotice.tsx',
      'utf8',
    );
    // 이 두 줄이 사라지면 고지가 둘 다 뜨거나 안 뜨게 된다.
    expect(src).toContain(
      "if (variant === 'coupang' && !isCoupang) return null;",
    );
    expect(src).toContain(
      "if (variant === 'general' && isCoupang) return null;",
    );
  });
});
