import {focusedScreenName} from '@/shared/lib/analytics/screen-tracking';

describe('focusedScreenName', () => {
  it('탭 첫 화면(TabRoot)은 탭 이름으로 갈린다', () => {
    const state = {
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          state: {
            index: 3,
            routes: [
              {name: 'HomeTab'},
              {name: 'DiscoverTab'},
              {name: 'CommunityTab'},
              {name: 'AlarmTab', state: {routes: [{name: 'TabRoot'}]}},
            ],
          },
        },
      ],
    };
    expect(focusedScreenName(state)).toBe('AlarmTab');
  });

  it('탭 위에 쌓인 화면은 그 화면 이름', () => {
    const state = {
      index: 1,
      routes: [{name: 'MainTabs'}, {name: 'ProductDetail'}],
    };
    expect(focusedScreenName(state)).toBe('ProductDetail');
  });

  it('상태가 없으면 undefined', () => {
    expect(focusedScreenName(undefined)).toBeUndefined();
  });
});
