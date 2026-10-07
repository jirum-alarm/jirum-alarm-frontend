import {matchMyKeyword} from '../src/features/keyword-prompt/model/myKeywords';

/** 알림 keyword 칸 → 내 키워드. web features/alarm/lib/matchMyKeyword 와 같은 규칙(2026-10-07 운영 실측 모양). */
describe('matchMyKeyword', () => {
  const mine: Set<string> = new Set(['햇반', '에어팟', '에어팟 프로', '콜라']);

  it('키워드 그대로·가격 하락 문구는 내 키워드로', () => {
    expect(matchMyKeyword('햇반', mine)).toBe('햇반');
    expect(matchMyKeyword('햇반 평소보다 54% 싸게 떴어요 📉', mine)).toBe(
      '햇반',
    );
    expect(
      matchMyKeyword('에어팟 프로 평소보다 10% 싸게 떴어요 📉', mine),
    ).toBe('에어팟 프로');
  });

  it('관심사 제목·부분일치·지운 키워드는 안 맞는다', () => {
    expect(
      matchMyKeyword('🥤 [생수·음료 쟁이기] 콜라 핫딜', mine),
    ).toBeUndefined();
    expect(matchMyKeyword('콜라겐', mine)).toBeUndefined();
    expect(matchMyKeyword('노트북', mine)).toBeUndefined();
    expect(matchMyKeyword(null, mine)).toBeUndefined();
  });
});
