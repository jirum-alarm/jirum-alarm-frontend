export {};
declare const __dirname: string;

/**
 * 카드가 쓰는 두 규칙. 화면 렌더 없이 로직만 검사한다.
 * (컴포넌트를 import 하면 RN·NativeWind 의존이 줄줄이 딸려온다)
 */

// 실제 함수 — 카드 상태 오버레이(ProductCardStatus)·홈 카드가 같이 쓴다(RN 의존 없는 순수 함수라 import 해도 된다).
import {formatMMD} from '../src/shared/lib/format/date';

/** DisplayProductSource 의 판매처/제보처 정리 규칙. */
function resolveSource(mallName?: string | null, providerName?: string | null) {
  const mall = mallName?.trim();
  const raw = providerName?.trim();
  const community = raw === mall ? undefined : raw;
  return {mall, community};
}

describe('formatMMD — web formatDateToMMD(MM.DD) 와 같아야 한다', () => {
  it('한 자리 월·일에 0 을 채운다', () => {
    // ★오프셋 없는 date-time 은 어느 머신에서든 "로컬 자정"으로 파싱된다.
    // +09:00 을 박으면 UTC 인 CI 에서 전날로 밀려 실패한다(로컬 KST 만 통과).
    expect(formatMMD('2026-01-05T00:00:00')).toBe('01.05');
    expect(formatMMD('2026-12-31T00:00:00')).toBe('12.31');
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

describe('splitPriceNote — 외화 원문 끝의 괄호 메모는 보조 글씨로', () => {
  const {splitPriceNote} = require('../src/shared/lib/format/price');

  it('환산가 괄호를 떼어 낸다', () => {
    expect(splitPriceNote('$259.9 (≈ 351,722 원)')).toEqual({
      main: '$259.9',
      note: '(≈ 351,722 원)',
    });
    expect(splitPriceNote('$ 2.67 (USD)')).toEqual({
      main: '$ 2.67',
      note: '(USD)',
    });
  });

  it('web 과 같은 정규식이다(같은 상품이 web·앱에서 다르게 보이지 않게)', () => {
    const fs = require('fs');

    const path = require('path');
    const read = (p: string) =>
      fs.readFileSync(path.join(__dirname, p), 'utf8');
    const rx = /\/\^\(\.\+\?\)[^/]*\$\/\.exec/;
    const web = read('../../web/src/shared/lib/utils/price.ts').match(rx)?.[0];
    const app = read('../src/shared/lib/format/price.ts').match(rx)?.[0];
    expect(app).toBeDefined();
    expect(web).toBe(app);
  });

  it('괄호가 없거나 괄호뿐이면 그대로', () => {
    expect(splitPriceNote('12,900')).toEqual({main: '12,900', note: null});
    expect(splitPriceNote('커뮤니티 확인')).toEqual({
      main: '커뮤니티 확인',
      note: null,
    });
    expect(splitPriceNote('(USD)')).toEqual({main: '(USD)', note: null});
  });
});
