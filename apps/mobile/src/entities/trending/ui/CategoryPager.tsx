import React, {useCallback, useEffect, useRef} from 'react';
import {
  FlatList,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {useContentWidth} from '@/shared/components/SideSafeArea';

import type {CategoryItem} from '@/shared/types/category';

/**
 * 카테고리 좌우 스와이프. web: widgets/trending/ui/trending-container (Swiper slidesPerView 1)
 *
 * ★ react-native-pager-view 대신 가로 FlatList + pagingEnabled — 네이티브 모듈을 더하면
 * 스토어 빌드를 기다려야 하는데, 이건 JS 만이라 OTA 로 바로 나간다.
 *
 * ★ 목록은 **보고 있는 페이지 하나만** 그린다. 옆 페이지까지 그려 두면 그 목록의
 * onViewableItemsChanged 가 화면 밖(가로)인데도 "보였다"로 세서 CTR 분모가 부풀고,
 * 랭킹 50장×3 을 늘 들고 있게 된다. 옆 페이지는 스켈레톤이고, 끌기 시작할 때
 * onDragStart 로 이웃 데이터를 미리 받아 두어 손을 떼면 바로 채워진다.
 *
 * 정본은 여전히 store(activeId)다 — 스와이프가 끝나면 onSwipeTo 로 알리고,
 * 칩·딥링크로 activeId 가 바뀌면 이 페이저가 그 페이지로 따라간다.
 */
export default function CategoryPager({
  categories,
  activeId,
  onSwipeTo,
  onDragStart,
  renderPage,
  renderPlaceholder,
}: {
  categories: CategoryItem[];
  activeId: number;
  onSwipeTo: (id: number) => void;
  /** 끌기 시작 — 양옆 카테고리 id(없으면 빠짐). 미리 받기용. */
  onDragStart?: (neighborIds: number[]) => void;
  renderPage: (category: CategoryItem) => React.ReactNode;
  renderPlaceholder: () => React.ReactNode;
}) {
  const width = useContentWidth();
  const listRef = useRef<FlatList<CategoryItem>>(null);
  const activeIndex = Math.max(
    0,
    categories.findIndex(c => c.id === activeId),
  );

  // 칩·딥링크로 바뀐 카테고리로 따라간다. 스와이프로 바뀐 경우엔 이미 그 자리라 제자리 이동이다.
  // 애니메이션 없이 — 멀리 떨어진 칩을 누르면 중간 페이지를 전부 훑고 지나가게 된다.
  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: activeIndex * width,
      animated: false,
    });
  }, [activeIndex, width, categories.length]);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      const next = categories[index];
      if (next && next.id !== activeId) onSwipeTo(next.id);
    },
    [width, categories, activeId, onSwipeTo],
  );

  const handleDragStart = useCallback(() => {
    if (!onDragStart) return;
    const ids = [categories[activeIndex - 1], categories[activeIndex + 1]]
      .filter((c): c is CategoryItem => !!c)
      .map(c => c.id);
    onDragStart(ids);
  }, [onDragStart, categories, activeIndex]);

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<CategoryItem>) => (
      <View style={{width}}>
        {item.id === activeId ? renderPage(item) : renderPlaceholder()}
      </View>
    ),
    [width, activeId, renderPage, renderPlaceholder],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  return (
    <FlatList
      ref={listRef}
      className="flex-1"
      data={categories}
      keyExtractor={pageKey}
      renderItem={renderItem}
      extraData={activeId}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      getItemLayout={getItemLayout}
      initialScrollIndex={activeIndex}
      initialNumToRender={1}
      maxToRenderPerBatch={1}
      windowSize={3}
      onScrollBeginDrag={handleDragStart}
      onMomentumScrollEnd={handleMomentumEnd}
    />
  );
}

const pageKey = (category: CategoryItem) => String(category.id);
