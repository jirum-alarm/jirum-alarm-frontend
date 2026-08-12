import React, {useCallback, useEffect, useRef} from 'react';
import {ActivityIndicator, Image, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {ProductQueries} from '@/entities/product/product.queries';
import ProductCarouselSection from '@/shared/components/product/ProductCarouselSection';
import {ProductService} from '@/shared/api/product/product.service';
import {pushRecentViewedProduct} from '@/shared/lib/device/recent-viewed';
import type {TabStackParamList} from '@/navigations/tab/types';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {setTabBarVisible} from '@/shared/hooks/useTabBarVisibility';

import ProductDetailWebViewScreen from './ProductDetailWebViewScreen';
import {parseSourceData} from './model/types';
import BottomCTA from './ui/BottomCTA';
import ProductInfo from './ui/ProductInfo';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.DETAIL
>;

type DetailNavigationProp = Props['navigation'];

/** `/products/123` 만 네이티브가 맡는다. 하위 경로(`/comment` 등)는 웹뷰로 넘긴다. */
function parseProductId(path: string): number | null {
  const pathname = path.split(/[?#]/)[0];
  const matched = pathname.match(/^\/products\/(\d+)\/?$/);
  return matched ? Number(matched[1]) : null;
}

export default function ProductDetailScreen(props: Props) {
  const productId = parseProductId(props.route.params.path);

  // 파싱 실패·하위 경로는 기존 웹뷰가 그대로 처리한다(라우팅 구멍 방지).
  if (productId === null) {
    return <ProductDetailWebViewScreen {...props} />;
  }
  return <NativeDetail productId={productId} />;
}

function NativeDetail({productId}: {productId: number}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DetailNavigationProp>();
  const {
    data: product,
    isPending,
    isError,
    refetch,
  } = useQuery(ProductQueries.info({id: productId}));

  const {data: togetherViewed, isPending: isTogetherViewedPending} = useQuery(
    ProductQueries.togetherViewed({productId, limit: 10}),
  );

  // 카드를 누르면 같은 스택에 상세를 하나 더 쌓는다(웹 링크와 같은 동선).
  const pushProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  // 웹뷰 화면과 달리 onNavigationStateChange 가 없으므로 직접 숨기고 되돌린다.
  // 안 하면 탭바가 하단 CTA 를 덮는다.
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      return () => setTabBarVisible(true);
    }, []),
  );

  // 조회 수집. 웹은 CollectProductOnView 가 하던 일로, 네이티브가 안 쏘면
  // 랭킹이 조회수를 먹는 만큼 조용히 왜곡된다.
  // StrictMode 이중 마운트·리렌더 중복 호출은 ref 로 막는다(web 과 같은 방식).
  const collectedRef = useRef<number | null>(null);
  useEffect(() => {
    if (collectedRef.current === productId) return;
    collectedRef.current = productId;
    void ProductService.collectProduct({
      productId,
      source: 'app_detail',
    }).catch(() => {});
  }, [productId]);

  // 최근 본 상품 — 안 쌓으면 웹뷰 홈의 "최근 본 상품"이 빈다.
  useEffect(() => {
    if (!product) return;
    void pushRecentViewedProduct({
      id: Number(product.id),
      title: product.title,
      thumbnail: product.thumbnail ?? null,
      price: product.price ?? null,
    });
  }, [product]);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#667085" />
      </View>
    );
  }

  if (isError || !product) {
    return <WebViewErrorView onRetry={refetch} />;
  }

  const source = parseSourceData(product.data);

  return (
    <View className="flex-1 bg-white">
      <SystemBars style="dark" hidden={false} />
      <View style={{height: insets.top}} className="bg-white" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{paddingBottom: 24}}
        showsVerticalScrollIndicator={false}>
        {product.thumbnail ? (
          <Image
            source={{uri: product.thumbnail}}
            className="aspect-square w-full"
            resizeMode="cover"
          />
        ) : null}
        <View className="rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <ProductInfo product={product} source={source} />
        </View>
        <ProductCarouselSection
          title="다른 고객이 함께 본 상품"
          products={togetherViewed}
          isPending={isTogetherViewedPending}
          onPressProduct={pushProduct}
        />
        {/* ponytail: 댓글·차트는 후속 커밋에서 네이티브로 붙인다. */}
      </ScrollView>
      <BottomCTA product={product} />
    </View>
  );
}

export {parseProductId};
