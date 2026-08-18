import React, {useMemo, useState} from 'react';
import {Dimensions, FlatList, Pressable, Text, View} from 'react-native';

import type {
  ContentPromotionSectionType,
  ProductCardType,
} from '../model/types';
import {
  CAROUSEL_CARD_WIDTH,
  CarouselCard,
  DoubleRowCard,
  GridCard,
  ListCard,
} from './cards/HomeProductCards';

/**
 * SDUI 레이아웃 디스패처. web: widgets/home/ui/DynamicProductList.tsx
 *
 * 데이터를 스스로 가져오지 않는다 — 상위(DynamicProductSection)가 내려준다.
 * web 과 동일하게 알 수 없는 타입은 null 을 반환한다.
 *
 * ★ 데스크톱 분기(`pc:`)는 전부 뺐다. RN 은 isMobile 이 상수라 web 의
 * `isMobile ? A : B` 중 A 만 남는다.
 *
 * ★ 캐러셀에 라이브러리를 쓰지 않는다 — swiper 옵션이 FlatList 에 1:1 대응한다:
 *     slidesPerView:'auto'  → 카드가 자기 너비를 가짐(RN 기본)
 *     spaceBetween:12       → ItemSeparatorComponent
 *     slidesOffsetBefore:20 → contentContainerStyle 의 좌우 패딩
 *   web 의 preventClicks/edgeSwipeThreshold 는 RN 제스처가 알아서 한다.
 */

const HORIZONTAL_PADDING = 20; // web px-5
const GRID_GAP_X = 12; // web gap-x-3
const GRID_GAP_Y = 20; // web gap-y-5

type Props = {
  type: ContentPromotionSectionType;
  products: ProductCardType[];
  onPressProduct: (id: number) => void;
};

export default function DynamicProductList({
  type,
  products,
  onPressProduct,
}: Props) {
  switch (type) {
    case 'GRID':
      return (
        <View style={{paddingHorizontal: HORIZONTAL_PADDING}}>
          <ProductGrid
            products={products}
            columns={2}
            onPressProduct={onPressProduct}
          />
        </View>
      );

    case 'PAGINATED_GRID':
      return (
        <PaginatedProductGrid
          products={products}
          onPressProduct={onPressProduct}
        />
      );

    case 'GRID_TABBED':
      return (
        <View style={{paddingHorizontal: HORIZONTAL_PADDING}}>
          {/* web: grid-cols-3 + displayTime={false} */}
          <ProductGrid
            products={products}
            columns={3}
            showTime={false}
            onPressProduct={onPressProduct}
          />
        </View>
      );

    case 'HORIZONTAL_SCROLL':
      return (
        <CarouselList products={products} onPressProduct={onPressProduct} />
      );

    case 'DOUBLE_ROW':
      // web 모바일 분기는 2행 캐러셀(데스크톱만 ListProductList).
      return (
        <DoubleRowCarousel
          products={products}
          onPressProduct={onPressProduct}
        />
      );

    case 'LIST':
      return (
        <View style={{paddingHorizontal: HORIZONTAL_PADDING}}>
          <ProductList products={products} onPressProduct={onPressProduct} />
        </View>
      );

    default:
      return null;
  }
}

/**
 * n열 그리드. FlatList numColumns 대신 flexWrap 을 쓴다 —
 * 홈은 이미 바깥이 스크롤이라 중첩 VirtualizedList 경고를 피해야 한다.
 */
function ProductGrid({
  products,
  columns,
  showTime = true,
  onPressProduct,
}: {
  products: ProductCardType[];
  columns: 2 | 3;
  showTime?: boolean;
  onPressProduct: (id: number) => void;
}) {
  const widthPercent = `${100 / columns}%` as const;
  // web `gap-y-5` 는 행 **사이**에만 붙는다. 모든 셀에 marginBottom 을 주면
  // 마지막 행 아래에 20px 이 남아 섹션 간격이 web 보다 넓어진다.
  const lastRowStart = Math.floor((products.length - 1) / columns) * columns;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -GRID_GAP_X / 2,
      }}>
      {products.map((product, i) => (
        <View
          key={product.id}
          style={{
            width: widthPercent,
            paddingHorizontal: GRID_GAP_X / 2,
            marginBottom: i >= lastRowStart ? 0 : GRID_GAP_Y,
          }}>
          <GridCard
            product={product}
            showTime={showTime}
            onPress={onPressProduct}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * PAGINATED_GRID — 모바일은 4개씩 끊어 보여주고 "추천 상품 더보기"로 순환한다.
 * web PaginatedProductGridList 와 동작 동일(마지막 페이지 다음은 첫 페이지).
 */
const ITEMS_PER_PAGE = 4; // web: !isMobile ? 5 : 4

function PaginatedProductGrid({
  products,
  onPressProduct,
}: {
  products: ProductCardType[];
  onPressProduct: (id: number) => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  const currentProducts = useMemo(
    () =>
      products.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE,
      ),
    [products, currentPage],
  );

  return (
    <View style={{gap: 24}}>
      <View style={{paddingHorizontal: HORIZONTAL_PADDING}}>
        <ProductGrid
          products={currentProducts}
          columns={2}
          onPressProduct={onPressProduct}
        />
      </View>

      <View className="items-center">
        <Pressable
          onPress={() => setCurrentPage(prev => (prev + 1) % totalPages)}
          className="h-9 flex-row items-center gap-2.5 rounded-lg bg-gray-100 px-5"
          accessibilityRole="button"
          accessibilityLabel={`추천 상품 더보기, ${
            currentPage + 1
          }/${totalPages} 페이지`}>
          <Text className="text-sm font-medium text-gray-900">
            추천 상품 더보기
          </Text>
          <Text className="text-sm">
            <Text className="text-gray-900">{currentPage + 1}</Text>
            <Text className="text-gray-500">/{totalPages}</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * HORIZONTAL_SCROLL — swiper → FlatList. 상세의 ProductCarouselSection 과 같은 매핑.
 * 발견 탭 랭킹 화면도 이 캐러셀을 그대로 쓴다(export).
 */
export function CarouselList({
  products,
  onPressProduct,
}: {
  products: ProductCardType[];
  onPressProduct: (id: number) => void;
}) {
  return (
    <FlatList
      horizontal
      data={products}
      keyExtractor={item => String(item.id)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingHorizontal: HORIZONTAL_PADDING}}
      ItemSeparatorComponent={() => <View style={{width: 12}} />}
      renderItem={({item}) => (
        <CarouselCard product={item} onPress={onPressProduct} />
      )}
      // 카드 폭이 고정이라 미리 알려주면 초기 렌더가 빨라진다.
      getItemLayout={(_, index) => ({
        length: CAROUSEL_CARD_WIDTH + 12,
        offset: (CAROUSEL_CARD_WIDTH + 12) * index,
        index,
      })}
    />
  );
}

/**
 * DOUBLE_ROW — 2개씩 묶어 세로로 쌓은 슬라이드를 가로 스크롤.
 *
 * ★ web 은 swiper `grid:{rows:2}` 를 쓰지 않는다. 배열을 2개씩 chunk 로 나눠
 * 한 슬라이드 안에 flex-col 로 넣을 뿐이라(DoubleRowCarouselProductList.tsx:41-47)
 * FlatList 로 그대로 옮겨진다. 슬라이드 폭은 web 과 같은 85%.
 */
function DoubleRowCarousel({
  products,
  onPressProduct,
}: {
  products: ProductCardType[];
  onPressProduct: (id: number) => void;
}) {
  // ★ 슬라이드 폭은 절대값이어야 한다.
  // '85%' 는 FlatList 안에서 콘텐츠 컨테이너 기준으로 풀려 실제 폭이 어긋나고,
  // 그러면 카드 히트영역이 화면 위치와 밀려서 **엉뚱한 카드가 눌린다**
  // (사용자 지적: "유통기한 임박 특가 클릭하면 이상하게 된다").
  const slideWidth = Math.round(
    (Dimensions.get('window').width - HORIZONTAL_PADDING * 2) * 0.85,
  );

  const pairs = useMemo(() => {
    const chunks: ProductCardType[][] = [];
    for (let i = 0; i < products.length; i += 2) {
      chunks.push(products.slice(i, i + 2));
    }
    return chunks;
  }, [products]);

  return (
    <FlatList
      horizontal
      data={pairs}
      keyExtractor={(_, index) => `double-row-${index}`}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingHorizontal: HORIZONTAL_PADDING}}
      ItemSeparatorComponent={() => <View style={{width: 12}} />}
      renderItem={({item}) => (
        <View style={{width: slideWidth, gap: 16}}>
          {item.map(product => (
            <DoubleRowCard
              key={product.id}
              product={product}
              onPress={onPressProduct}
            />
          ))}
        </View>
      )}
    />
  );
}

/**
 * LIST — 세로 목록.
 * web ListProductList: `gap-4`(16px) + **slice(0, 4)** — 4개까지만 그린다.
 * limit 이 4 라 대개 같지만, 상한을 안 걸면 데이터가 늘었을 때 웹과 갈린다.
 */
function ProductList({
  products,
  onPressProduct,
}: {
  products: ProductCardType[];
  onPressProduct: (id: number) => void;
}) {
  return (
    <View style={{gap: 16}}>
      {products.slice(0, 4).map(product => (
        <ListCard key={product.id} product={product} onPress={onPressProduct} />
      ))}
    </View>
  );
}
