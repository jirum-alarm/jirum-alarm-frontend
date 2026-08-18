import React, {useEffect, useRef} from 'react';
import {ScrollView, Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import {cn} from '@/shared/lib/styling';

import type {CategoryItem} from '@/entities/category/category.queries';

/**
 * 카테고리 뱃지 줄. web: widgets/trending/ui/TabbbarV2.tsx (뱃지형)
 * 활성 = 어두운 배경 + primary 글자, 비활성 = 회색 배경.
 *
 * ★ web 은 motion drag 로 스트립을 직접 끌지만 RN 은 ScrollView 가 그 일을
 * 이미 한다 — 279줄이 여기서 60줄이 된 이유다.
 * 활성 탭을 화면 안으로 넣어주는 스크롤만 옮겼다.
 */

const H_PADDING = 20;
const GAP = 10; // web gap-2.5

export default function CategoryTabBar({
  categories,
  activeId,
  onSelect,
}: {
  categories: CategoryItem[];
  activeId: number;
  onSelect: (id: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  // 각 칩의 x 위치·폭. onLayout 으로 모아 활성 칩을 가운데로 보낸다.
  const layoutsRef = useRef<Record<number, {x: number; width: number}>>({});
  const viewportRef = useRef(0);

  useEffect(() => {
    const layout = layoutsRef.current[activeId];
    const viewport = viewportRef.current;
    if (!layout || !viewport) return;
    // 칩 중앙을 화면 중앙에 맞춘다(web scrollToTab 과 같은 계산).
    const target = layout.x + layout.width / 2 - viewport / 2;
    scrollRef.current?.scrollTo({x: Math.max(0, target), animated: true});
  }, [activeId, categories.length]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={e => {
        viewportRef.current = e.nativeEvent.layout.width;
      }}
      // ChipRow 와 같은 이유로 높이를 고정한다 — ScrollView 는 안 주면
      // 콘텐츠보다 큰 영역을 잡아 칩 위아래에 빈 띠가 생긴다.
      style={{flexGrow: 0, height: 36}}
      contentContainerStyle={{
        paddingHorizontal: H_PADDING,
        alignItems: 'center',
        gap: GAP,
      }}>
      {categories.map(category => {
        const isActive = category.id === activeId;
        return (
          <View
            key={category.id}
            onLayout={e => {
              const {x, width} = e.nativeEvent.layout;
              layoutsRef.current[category.id] = {x, width};
            }}>
            <PressableScale
              onPress={() => onSelect(category.id)}
              accessibilityRole="tab"
              accessibilityState={{selected: isActive}}
              accessibilityLabel={category.name}
              className={cn(
                'rounded-full px-3 py-2',
                isActive ? 'bg-gray-800' : 'bg-gray-100',
              )}>
              <Text
                className={cn(
                  'text-sm leading-none',
                  isActive
                    ? 'text-primary-500 font-bold'
                    : 'font-medium text-gray-500',
                )}>
                {category.name}
              </Text>
            </PressableScale>
          </View>
        );
      })}
    </ScrollView>
  );
}
