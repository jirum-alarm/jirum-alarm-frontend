import {
  createScreenTracker,
  focusedScreenName,
} from '@/shared/lib/analytics/screen-tracking';

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
              {name: 'KeywordsTab'},
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

describe('createScreenTracker — 화면 인스턴스(key)가 바뀔 때만 센다', () => {
  const stack = (
    ...routes: {name: string; key: string; params?: unknown}[]
  ) => ({
    index: routes.length, // 맨 앞 MainTabs 다음의 마지막 화면
    routes: [{name: 'MainTabs', key: 'tabs'}, ...routes],
  });
  const detail = (key: string, id: number) => ({
    name: 'ProductDetail',
    key,
    params: {path: `/products/${id}`},
  });

  it('★상세 → 상세(push)도 두 번째 상세를 센다', () => {
    const seen: string[] = [];
    const track = createScreenTracker(name => seen.push(name));
    track(stack(detail('d1', 1)));
    track(stack(detail('d1', 1), detail('d2', 2)));
    expect(seen).toEqual(['ProductDetail', 'ProductDetail']);
  });

  it('뒤로 가서 앞 상세로 돌아와도 센다(웹 페이지뷰와 같다)', () => {
    const seen: string[] = [];
    const track = createScreenTracker(name => seen.push(name));
    track(stack(detail('d1', 1)));
    track(stack(detail('d1', 1), detail('d2', 2)));
    track(stack(detail('d1', 1)));
    expect(seen).toHaveLength(3);
  });

  it('같은 화면 안 상태 변화(params·하위 상태)는 한 번만', () => {
    const seen: string[] = [];
    const track = createScreenTracker(name => seen.push(name));
    track(stack(detail('d1', 1)));
    track(stack({...detail('d1', 1), params: {path: '/products/1?tab=x'}}));
    expect(seen).toEqual(['ProductDetail']);
  });

  it('탭 첫 화면은 탭 이름으로, 탭을 오가면 센다', () => {
    const seen: string[] = [];
    const track = createScreenTracker(name => seen.push(name));
    const tab = (name: string, rootKey: string) => ({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          key: 'tabs',
          state: {
            index: 0,
            routes: [
              {
                name,
                key: `${name}-k`,
                state: {routes: [{name: 'TabRoot', key: rootKey}]},
              },
            ],
          },
        },
      ],
    });
    track(tab('HomeTab', 'r1'));
    track(tab('AlarmTab', 'r2'));
    track(tab('AlarmTab', 'r2'));
    expect(seen).toEqual(['HomeTab', 'AlarmTab']);
  });
});
