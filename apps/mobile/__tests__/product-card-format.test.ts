export {};

/**
 * 카드가 쓰는 두 규칙. 화면 렌더 없이 로직만 검사한다.
 * (컴포넌트를 import 하면 RN·NativeWind 의존이 줄줄이 딸려온다)
 */

/** ProductCard 의 formatMMD 와 같은 구현. */
function formatMMD(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}

/** DisplayProductSource 의 판매처/제보처 정리 규칙. */
function resolveSource(mallName?: string | null, providerName?: string | null) {
  const mall = mallName?.trim();
  const raw = providerName?.trim();
  const community = raw === mall ? undefined : raw;
  return {mall, community};
}

describe('formatMMD — web formatDateToMMD(MM.DD) 와 같아야 한다', () => {
  it('한 자리 월·일에 0 을 채운다', () => {
    expect(formatMMD('2026-01-05T00:00:00+09:00')).toBe('01.05');
    expect(formatMMD('2026-12-31T00:00:00+09:00')).toBe('12.31');
  });

  it('잘못된 날짜는 빈 문자열', () => {
    expect(formatMMD('not-a-date')).toBe('');
  });
});

describe('DisplayProductSource — 판매처와 제보 커뮤니티는 다른 슬롯', () => {
  // 실측상 전 표본이 불일치한다(롯데온 vs 에펨코리아).
  it('둘 다 있으면 둘 다 남는다', () => {
    expect(resolveSource('롯데온', '에펨코리아')).toEqual({
      mall: '롯데온',
      community: '에펨코리아',
    });
  });

  // 몰이 직접 제보하면 같은 이름이 두 번 찍힌다("알토란마켓 · 알토란마켓").
  it('같은 이름이면 커뮤니티를 지운다', () => {
    expect(resolveSource('알토란마켓', '알토란마켓')).toEqual({
      mall: '알토란마켓',
      community: undefined,
    });
  });

  it('몰이 비어도 커뮤니티만으로 줄이 성립한다', () => {
    expect(resolveSource(null, '뽐뿌')).toEqual({
      mall: undefined,
      community: '뽐뿌',
    });
  });
});
