import React, {useCallback, useLayoutEffect, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import CurationGrid from '@/entities/home/ui/CurationGrid';
import {ProductQueries} from '@/entities/product/product.queries';
import type {ProductFlowParamList} from '@/navigations/tab/types';
import {OrderOptionType, ProductOrderType} from '@/shared/api/gql/graphql';
import ProductCard from '@/shared/components/product/ProductCard';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {openSearch} from '@/shared/lib/navigation/search-flow';

import {deriveSearchKeyword} from './ui/ExpiredProductWarning';
import {
  DetailHeaderActions,
  DetailHeaderBackButton,
} from './ui/ProductDetailHeader';

/** web RelatedProductsView 와 같은 한도 — 한 번에 받아 무한 스크롤 없이 그린다. */
const LIMIT = 50;

/**
 * 관련 상품(만료 딜의 「더보기」). web `/products/{id}/related` — 예전엔 이 경로만 웹뷰로 열렸다.
 * 같은 규칙: 제목에서 뽑은 키워드로 검색, 자기 자신은 뺀다.
 */
export default function RelatedProductsScreen({
  productId,
}: {
  productId: number;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProductFlowParamList>>();
  const bottomClip = useHiddenTabBarClipPadding();

  // 상세에서 왔으면 이미 캐시에 있다.
  const info = useQuery(ProductQueries.info({id: productId}));
  const keyword = info.data ? deriveSearchKeyword(info.data.title) : '';

  const {data, isPending, isError, refetch} = useQuery({
    ...ProductQueries.keywordProducts({
      keyword,
      limit: LIMIT,
      orderBy: ProductOrderType.Id,
      orderOption: OrderOptionType.Desc,
    }),
    enabled: keyword.length > 0,
  });

  const items = useMemo(() => {
    const seen = new Set<string>();
    return (data ?? []).filter(p => {
      const k = String(p.id);
      if (Number(p.id) === productId || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [data, productId]);

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
      // 제목(키워드)을 기다리는 동안도 로딩으로 본다. 키워드가 비면 쿼리가 꺼져 pending 에 머무니 빈 목록으로.
      isPending={info.isPending || (keyword.length > 0 && isPending)}
      isError={info.isError || isError}
      label="관련 상품"
      onRetry={info.isError ? info.refetch : refetch}
      emptyText="유사한 상품이 없어요."
      bottomInset={bottomClip}
    />
  );
}
