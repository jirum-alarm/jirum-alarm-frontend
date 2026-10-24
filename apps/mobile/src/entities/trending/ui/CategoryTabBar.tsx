import React, {useEffect, useRef} from 'react';
import {ScrollView, View} from 'react-native';

import TabPill from '@/shared/components/ui/TabPill';

import type {CategoryItem} from '@/shared/types/category';

/**
 * 카테고리 뱃지 줄. web: widgets/trending/ui/TabbbarV2.tsx (뱃지형)
 * 활성 = 어두운 배경 + primary 글자, 비활성 = 회색 배경 — 공용 TabPill(brand, md).
 *
 * ★ web 은 motion drag 로 스트립을 직접 끌지만 RN 은 ScrollView 가 그 일을
 * 이미 한다 — 279줄이 여기서 60줄이 된 이유다.
 * 활성 탭을 화면 안으로 넣어주는 스크롤만 옮겼다.
 *
 * trailing = 줄 오른쪽 끝에 고정되는 조작(「실시간」의 「핫딜만」 칩). 칩 줄만 스크롤되고 끝은 안 움직인다.
 */

const H_PADDING = 20;
const GAP = 10; // web gap-2.5
/** 칩 줄 ↔ 끝 조작 사이(구분선 양쪽). web TabBarV2 trailing 의 pl-3 와 같다. */
const TRAILING_GAP = 12;

export default function CategoryTabBar({
  categories,
  activeId,
  onSelect,
  trailing,
}: {
  categories: CategoryItem[];
  activeId: number;
  onSelect: (id: number) => void;
  trailing?: React.ReactNode;
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

  const strip = (
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
        paddingLeft: H_PADDING,
        paddingRight: trailing ? TRAILING_GAP : H_PADDING,
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
            <TabPill
              label={category.name}
              selected={isActive}
              variant="brand"
              size="md"
              onPress={() => onSelect(category.id)}
            />
          </View>
        );
      })}
    </ScrollView>
  );

  if (!trailing) return strip;
  return (
    <View className="flex-row items-center">
      <View className="flex-1">{strip}</View>
      <View className="h-5 w-px bg-gray-200" />
      <View style={{paddingLeft: TRAILING_GAP, paddingRight: H_PADDING}}>
        {trailing}
      </View>
    </View>
  );
}
