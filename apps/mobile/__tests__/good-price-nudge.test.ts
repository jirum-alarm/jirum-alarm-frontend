import {
  goodPriceText,
  topKeywordToday,
} from '@/screens/alarm/lib/notification-source';

const mine = new Set(['햇반', '펩시']);

describe('알림함 「좋은 가격만 받기」 권유 규칙', () => {
  it('오늘 가장 많이 온 내 키워드 — 하락 문구도 그 키워드로, 24시간 밖·관심사는 뺀다', () => {
    const now = Date.parse('2026-10-15T12:00:00Z');
    const at = (h: number) => new Date(now - h * 3600_000).toISOString();
    expect(
      topKeywordToday(
        [
          {keyword: '펩시', createdAt: at(1)},
          {keyword: '펩시 평소보다 12% 싸게 떴어요 📉', createdAt: at(2)},
          {keyword: '햇반', createdAt: at(3)},
          {keyword: '펩시', createdAt: at(30)},
          {keyword: '🥤 [생수·음료 쟁이기] 펩시 핫딜', createdAt: at(1)},
        ],
        mine,
        now,
      ),
    ).toEqual({keyword: '펩시', count: 2});
    expect(topKeywordToday([], mine, now)).toBeUndefined();
  });

  it('좋은 가격 문구가 웹과 같다', () => {
    expect(goodPriceText('LITER', 1400)).toBe('1L당 1,400원');
    expect(goodPriceText('FACE_VALUE', 0.923)).toBe('액면가의 92%');
    expect(goodPriceText('TOTAL', 289000)).toBe('289,000원');
  });
});
