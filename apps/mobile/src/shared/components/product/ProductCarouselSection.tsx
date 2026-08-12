import React, {useCallback} from 'react';
import {ActivityIndicator, FlatList, Text, View} from 'react-native';

import ProductCard, {
  type ProductCardItem,
} from '@/shared/components/product/ProductCard';

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
  onPressProduct,
}: {
  title: string;
  products: ProductCardItem[] | undefined;
  isPending?: boolean;
  onPressProduct: (id: number) => void;
}) {
  const renderItem = useCallback(
    ({item}: {item: ProductCardItem}) => (
      <ProductCard product={item} onPress={onPressProduct} />
    ),
    [onPressProduct],
  );

  // 빈 섹션을 제목만 남기고 보여주면 "로딩이 멈춘 것"처럼 보인다. 통째로 숨긴다.
  if (!isPending && (!products || products.length === 0)) return null;

  return (
    <View className="pt-7">
      <Text className="px-5 pb-3 text-lg font-semibold text-gray-900">
        {title}
      </Text>
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
