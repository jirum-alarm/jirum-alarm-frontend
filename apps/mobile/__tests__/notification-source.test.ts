import {
  notificationSourceKey,
  parseSourceKey,
  recentKeywordAlertCount,
  sourceLabel,
} from '../src/screens/alarm/lib/notification-source';

/** 알림 keyword 칸 → 어디서 온 알림인가. 실측 모양(2026-10-07)으로 고정한다. */
describe('notificationSourceKey', () => {
  const mine: Set<string> = new Set(['햇반', '펩시']);
  const themes: {id: string; name: string}[] = [
    {id: '3', name: '생수·음료 쟁이기'},
  ];
  const label = (field: string | null) => {
    const key = notificationSourceKey(field, mine, themes);
    return key ? sourceLabel(parseSourceKey(key)) : undefined;
  };

  it('키워드·가격 하락 → 키워드, 관심사 제목 → 관심사, 좋은 딜 → 좋은 딜', () => {
    expect(label('햇반 평소보다 54% 싸게 떴어요 📉')).toBe('햇반 키워드 알림');
    expect(label('🥤 [생수·음료 쟁이기] 펩시 핫딜')).toBe(
      '생수·음료 쟁이기 관심사 알림',
    );
    expect(
      parseSourceKey(
        notificationSourceKey('🥤 [생수·음료 쟁이기] 펩시 핫딜', mine, themes)!,
      ),
    ).toEqual({
      kind: 'theme',
      themeId: '3',
      name: '생수·음료 쟁이기',
    });
    expect(label('🔥 지금 뜨는 좋은 딜')).toBe('지금 뜨는 좋은 딜 알림');
  });

  it('지운 키워드·없는 관심사·빈 값은 라벨 없음', () => {
    expect(label('삼다수')).toBeUndefined();
    expect(label('🍜 [없어진 관심사] 라면 핫딜')).toBeUndefined();
    expect(label(null)).toBeUndefined();
  });
});

describe('recentKeywordAlertCount — 알림함 「핫딜만 받기」 권유', () => {
  const NOW = new Date('2026-10-14T12:00:00Z').getTime();
  const hoursAgo = (h: number): string =>
    new Date(NOW - h * 3600_000).toISOString();

  it('최근 24시간의 내 키워드 알림만 센다(관심사·좋은 딜·지난 날은 빼고)', () => {
    const mine: Set<string> = new Set(['콜라', '에어팟 프로']);
    const notifications: {keyword: string | null; createdAt: string}[] = [
      {keyword: '콜라', createdAt: hoursAgo(1)},
      {keyword: '콜라 최근 딜보다 싸게 떴어요 📉', createdAt: hoursAgo(2)},
      {keyword: '에어팟 프로', createdAt: hoursAgo(23)},
      {keyword: '콜라', createdAt: hoursAgo(25)},
      {keyword: '🥤 [생수·음료 쟁이기] 펩시 핫딜', createdAt: hoursAgo(1)},
      {keyword: '(광고) 🔥 지금 뜨는 좋은 딜', createdAt: hoursAgo(1)},
      {keyword: null, createdAt: hoursAgo(1)},
    ];
    expect(recentKeywordAlertCount(notifications, mine, NOW)).toBe(3);
  });
});
