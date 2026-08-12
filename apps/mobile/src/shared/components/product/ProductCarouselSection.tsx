import React, {useCallback} from 'react';
import {ActivityIndicator, FlatList, Text, View} from 'react-native';

import ProductCard, {
  type ProductCardItem,
} from '@/shared/components/product/ProductCard';
import SectionErrorRow from '@/shared/components/SectionErrorRow';

/**
 * 가로 캐러셀 섹션.
 *
 * web 은 swiper 를 쓰지만 설정(slidesPerView:'auto', spaceBetween:12,
 * slidesOffsetBefore:20)이 FlatList 에 1:1 대응된다 — 라이브러리 불필요.
 */
export default function ProductCarouselSection({
  title,
  products,
  isPending,
  isError,
  onRetry,
  onPressProduct,
}: {
  title: string;
  products: ProductCardItem[] | undefined;
  isPending?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPressProduct: (id: number) => void;
}) {
  const renderItem = useCallback(
    ({item}: {item: ProductCardItem}) => (
      <ProductCard product={item} onPress={onPressProduct} />
    ),
    [onPressProduct],
  );

  // 실패는 숨기지 않는다 — 빈 것과 구별돼야 사용자가 재시도할 수 있다.
  if (isError && onRetry) {
    return (
      <View className="pt-7">
        <Text className="px-5 pb-1 text-lg font-semibold text-gray-900">
          {title}
        </Text>
        <SectionErrorRow label={title} onRetry={onRetry} />
      </View>
    );
  }

  // 빈 섹션을 제목만 남기고 보여주면 "로딩이 멈춘 것"처럼 보인다. 통째로 숨긴다.
  if (!isPending && (!products || products.length === 0)) return null;

  return (
    <View className={title ? 'pt-7' : 'pt-3'}>
      {/* 제목 없이 캐러셀만 쓰는 자리가 있다(만료 경고). 빈 헤더를 그리지 않는다. */}
      {title ? (
        <Text className="px-5 pb-3 text-lg font-semibold text-gray-900">
          {title}
        </Text>
      ) : null}
      {isPending ? (
        <View className="h-[200px] items-center justify-center">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      ) : (
        <FlatList
          horizontal
          data={products}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 20}}
          ItemSeparatorComponent={() => <View style={{width: 12}} />}
          // 카드가 120px 고정이라 스크롤 위치 계산을 미리 줄 수 있다.
          initialNumToRender={4}
          windowSize={5}
        />
      )}
    </View>
  );
}
