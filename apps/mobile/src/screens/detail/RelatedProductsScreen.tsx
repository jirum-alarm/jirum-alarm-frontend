import React, {useCallback, useLayoutEffect, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQueries} from '@tanstack/react-query';

import CurationGrid from '@/entities/home/ui/CurationGrid';
import {ProductQueries} from '@/entities/product/product.queries';
import type {ProductFlowParamList} from '@/navigations/tab/types';
import ProductCard from '@/shared/components/product/ProductCard';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {openSearch} from '@/shared/lib/navigation/search-flow';

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
    (id: number) =>
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`}),
    [navigation],
  );

  return (
    <CurationGrid
      items={items}
      keyOf={item => String(item.id)}
      renderCard={item => (
        <ProductCard product={item} layout="grid" onPress={pushProduct} />
      )}
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
