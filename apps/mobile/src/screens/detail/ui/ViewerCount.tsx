import React from 'react';
import {Text, View} from 'react-native';

/** web 과 같은 노출 하한 — 이보다 적으면 "N명이 살펴본"이 되레 빈약해 보인다. */
export const MIN_VIEWER_COUNT = 10;

/** 조회수 띠 높이. 판정 카드 "기준 보기" 스크롤이 sticky 띠에 가리지 않게 빼는 값. */
export const VIEWER_COUNT_HEIGHT = 48;

/**
 * "N명이 살펴본 상품" 띠. web `features/product-detail/ui/mobile/ViewerCount.tsx` 이식.
 *
 * web 은 맨 위에선 가로 꽉 찬 띠였다가, 스크롤하면 헤더 아래 떠 있는 둥근 알약으로
 * 바뀐다(sticky). 앱은 ScrollView `stickyHeaderIndices` 로 붙이고, 모양 전환은
 * `collapsed`(스크롤 여부)로 한다.
 *
 * 🔴모양 전환은 **style 로만** 한다. className 을 조건부로 바꾸면(특히 `translate-*`
 * 처럼 transform 을 새로 붙이면) NativeWind(css-interop)가 컴포넌트를 다른 래퍼로
 * 갈아 끼워 다시 렌더하는데, sticky header 안에서 그게 "Couldn't find a navigation
 * context" 로 터졌다(안드로이드 에뮬레이터 실측 2026-09-25 — 스크롤하자마자 레드스크린).
 * ponytail: web 의 폭·모서리 애니메이션(motion)은 옮기지 않았다 — 모양만 즉시 바뀐다.
 */
export default function ViewerCount({
  count,
  collapsed,
}: {
  count: number;
  collapsed: boolean;
}) {
  return (
    <View
      className="w-full items-center justify-center"
      style={{height: VIEWER_COUNT_HEIGHT}}>
      <View
        className="items-center justify-center border bg-secondary-50 px-5"
        style={{
          height: VIEWER_COUNT_HEIGHT,
          width: collapsed ? undefined : '100%',
          borderRadius: collapsed ? VIEWER_COUNT_HEIGHT / 2 : 0,
          borderColor: collapsed ? '#B5CBFD' : '#F3F7FF',
          transform: [{translateY: collapsed ? 8 : 0}],
        }}>
        <Text className="text-sm text-gray-700">
          <Text className="font-semibold text-secondary-500">
            {count.toLocaleString('ko-KR')}명
          </Text>
          이 살펴본 상품
        </Text>
      </View>
    </View>
  );
}
