import React, {useCallback, useLayoutEffect, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQueries} from '@tanstack/react-query';

import CurationGrid from '@/entities/home/ui/CurationGrid';
import {ProductQueries} from '@/entities/product/product.queries';
import type {ProductFlowParamList} from '@/shared/lib/navigation/param-list';
import ProductCard from '@/entities/product/ui/ProductCard';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {openSearch} from '@/shared/lib/navigation/search-flow';
import {pushProductDetail} from '@/shared/lib/navigation/detail-chain';

import {
  DetailHeaderActions,
  DetailHeaderBackButton,
} from './ui/ProductDetailHeader';

/** web RelatedProductsView 와 같은 한도 — 한 번에 받아 무한 스크롤 없이 그린다. */
const LIMIT = 20;

/**
 * 관련 상품(만료 딜의 「더보기」). web `/products/{id}/related` — 예전엔 이 경로만 웹뷰로 열렸다.
 * 같은 출처: 동일상품 그룹 + 이 글보다 새 진행 중 딜 중 같은 상품·같은 라인(서버 latestSimilarDeals).
 * 예전 제목 키워드 검색(50개, 오래된 글 포함)은 무관 상품이 섞였다.
 */
export default function RelatedProductsScreen({
  productId,
}: {
  productId: number;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProductFlowParamList>>();
  const bottomClip = useHiddenTabBarClipPadding();

  const [same, latest] = useQueries({
    queries: [
      ProductQueries.sameProductDeals({id: productId}),
      ProductQueries.latestSimilarDeals({id: productId, limit: LIMIT}),
    ],
  });

  const items = useMemo(() => {
    const seen = new Set<string>();
    return [...(same.data ?? []), ...(latest.data ?? [])].filter(p => {
      const k = String(p.id);
      if (Number(p.id) === productId || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [same.data, latest.data, productId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '관련 상품',
      headerLeft: ({canGoBack}) =>
        canGoBack ? (
          <DetailHeaderBackButton onPress={() => navigation.goBack()} />
        ) : null,
      headerRight: () => (
        <DetailHeaderActions onPressSearch={() => openSearch(navigation)} />
      ),
    });
  }, [navigation]);

  const pushProduct = useCallback(
    (id: number) => pushProductDetail(navigation, `/products/${id}`),
    [navigation],
  );
  // ★고정한다 — 인라인이면 그리드가 다시 그려질 때마다 보이는 카드가 전부 다시 그려진다.
  const renderCard = useCallback(
    (item: (typeof items)[number]) => (
      <ProductCard product={item} layout="grid" onPress={pushProduct} />
    ),
    [pushProduct],
  );

  return (
    <CurationGrid
      items={items}
      keyOf={item => String(item.id)}
      renderCard={renderCard}
      isPending={same.isPending || latest.isPending}
      // 한쪽만 실패하면 받은 쪽만 보인다 — 둘 다 비었을 때만 오류.
      isError={(same.isError || latest.isError) && items.length === 0}
      label="관련 상품"
      onRetry={() => {
        same.refetch();
        latest.refetch();
      }}
      emptyText="유사한 상품이 없어요."
      bottomInset={bottomClip}
    />
  );
}
