import React from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {text} from '@jirum/design-system/recipes';

/** web 과 같은 노출 하한 — 이보다 적으면 "N명이 살펴본"이 되레 빈약해 보인다. */
export const MIN_VIEWER_COUNT = 10;

/**
 * "N명이 살펴본 상품" 알약 — 상품 이미지 상자 안 위쪽 가운데에 겹쳐 띄운다(web `features/product-detail/ui/ViewerCount.tsx`).
 *
 * 예전엔 ScrollView sticky 띠였다가 스크롤하면 헤더 아래 떠 있는 알약이 돼, 스크롤 내내 따라다니며
 * 정보 표·가격 추이 숫자·커뮤니티 요약 글자를 덮었다. web 은 같은 이유로 10/12 이미지 상자 안으로 옮겼다 —
 * 이미지 상자에 두면 본문 카드가 올라올 때 이미지와 함께 지나간다. 부모(이미지 상자)는 relative 여야 한다.
 */
export default function ViewerCount({count}: {count: number}) {
  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 top-3 z-10 items-center">
      <View className="h-9 items-center justify-center rounded-full border border-secondary-200 bg-secondary-50 px-4">
        <Text className={text.body}>
          <Text className="font-semibold text-secondary-600">
            {count.toLocaleString('ko-KR')}명
          </Text>
          이 살펴본 상품
        </Text>
      </View>
    </View>
  );
}
