import {
  notificationSourceKey,
  parseSourceKey,
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
