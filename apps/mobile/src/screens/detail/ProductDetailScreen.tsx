import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {ActivityIndicator, Image, ScrollView, View} from 'react-native';
import {SystemBars} from 'react-native-edge-to-edge';
import {useNavigation} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/elements';
import {useQuery} from '@tanstack/react-query';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  OrderOptionType,
  ProductOrderType,
  UploaderType,
} from '@/shared/api/gql/graphql';
import {ProductQueries} from '@/entities/product/product.queries';
import ProductCarouselSection from '@/shared/components/product/ProductCarouselSection';
import CommentSection from '@/features/comment/ui/CommentSection';
import PriceHistorySection from '@/features/price-history/ui/PriceHistorySection';
import {UserQueries} from '@/entities/user/user.queries';
import {ProductService} from '@/shared/api/product/product.service';
import {
  buildRecentViewedInjectScript,
  getRecentViewedProducts,
  pushRecentViewedProduct,
} from '@/shared/lib/device/recent-viewed';
import type {ProductFlowParamList} from '@/navigations/tab/types';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {useAuth} from '@/shared/hooks/useAuth';
import {
  useHideTabBar,
  useHiddenTabBarClipPadding,
} from '@/shared/hooks/useHideTabBar';
import {goTabHome, openSearch} from '@/shared/lib/navigation/search-flow';
import {useWebviewContext} from '@/provider/WebViewRefProvider';

import ProductDetailWebViewScreen from './ProductDetailWebViewScreen';
import {parseSourceData} from './model/types';
import BottomCTA from './ui/BottomCTA';
import ProductInfo from './ui/ProductInfo';
import AffiliateNotice from './ui/AffiliateNotice';
import ExpiredProductWarning from './ui/ExpiredProductWarning';
import {DetailHeaderActions, DetailHeaderTitle} from './ui/ProductDetailHeader';
import ShareSheet from './ui/ShareSheet';
import KakaoOpenChatPrompt from './ui/KakaoOpenChatPrompt';
import TossDetailImages from './ui/TossDetailImages';
import CommunityReaction from '@/features/community-reaction/ui/CommunityReaction';

type Props = NativeStackScreenProps<
  ProductFlowParamList,
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
  const scrollRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const [showTopButton, setShowTopButton] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const navigation = useNavigation<DetailNavigationProp>();
  // 상세 하단은 찜/구매 CTA 가 탭바를 대신한다.
  useHideTabBar();
  const tabBarClipPad = useHiddenTabBarClipPadding();
  const {getWebViewRef} = useWebviewContext();
  const {
    data: product,
    isPending,
    isError,
    refetch,
  } = useQuery(ProductQueries.info({id: productId}));

  const {data: myUserId} = useQuery(UserQueries.me());
  const {isLogin} = useAuth();

  const {
    data: togetherViewed,
    isPending: isTogetherViewedPending,
    isError: isTogetherViewedError,
    refetch: refetchTogetherViewed,
  } = useQuery(ProductQueries.togetherViewed({productId, limit: 10}));

  const {
    data: categoryPopular,
    isPending: isCategoryPending,
    isError: isCategoryError,
    refetch: refetchCategory,
  } = useQuery({
    ...ProductQueries.categoryPopular({
      categoryIds: product?.categoryId ? [product.categoryId] : [],
      limit: 20,
      // web CategoryPopularSection 과 같은 정렬.
      orderBy: ProductOrderType.CommunityRanking,
      orderOption: OrderOptionType.Desc,
    }),
    // categoryId 는 상세를 받아야 알 수 있다.
    enabled: !!product?.categoryId,
  });

  // 카드를 누르면 같은 스택에 상세를 하나 더 쌓는다(웹 링크와 같은 동선).
  const pushProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => null,
      headerLeft: ({tintColor, canGoBack}) => (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {canGoBack ? (
            <HeaderBackButton
              tintColor={tintColor}
              displayMode="minimal"
              onPress={() => navigation.goBack()}
            />
          ) : null}
          <DetailHeaderTitle onPress={() => goTabHome(navigation)} />
        </View>
      ),
      headerRight: () => (
        <DetailHeaderActions
          onPressSearch={() => openSearch(navigation)}
          onPressShare={() => setShareOpen(true)}
        />
      ),
    });
  }, [navigation]);

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

  // 최근 본 상품 — 네이티브 AsyncStorage + 웹뷰 localStorage.
  // 웹뷰에 안 심으면 커뮤니티 상품 태그 모달의 "최근 본 상품"이 빈다.
  useEffect(() => {
    if (!product) return;
    (async () => {
      await pushRecentViewedProduct({
        id: Number(product.id),
        title: product.title,
        thumbnail: product.thumbnail ?? null,
        price: product.price ?? null,
      });
      const list = await getRecentViewedProducts();
      const script = buildRecentViewedInjectScript(list);
      for (const tab of Object.values(tabNavigations)) {
        getWebViewRef(tab)?.current?.injectJavaScript(script);
      }
    })().catch(() => {});
  }, [product, getWebViewRef]);

  const shareSheet = (
    <ShareSheet
      visible={shareOpen}
      onClose={() => setShareOpen(false)}
      productId={productId}
      title={product?.title ?? '지름알림'}
      description={
        [product?.price, product?.mallName].filter(Boolean).join(' · ') ||
        undefined
      }
      imageUrl={product?.thumbnail ?? undefined}
    />
  );

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#667085" />
        {shareSheet}
      </View>
    );
  }

  if (isError || !product) {
    return (
      <>
        <WebViewErrorView onRetry={refetch} />
        {shareSheet}
      </>
    );
  }

  const source = parseSourceData(product.data);

  return (
    <View className="flex-1 bg-white" style={{paddingBottom: tabBarClipPad}}>
      <SystemBars style="dark" hidden={false} />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{paddingBottom: 0}}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={e => {
          const y = e.nativeEvent.contentOffset.y;
          setShowTopButton(y > 200 && y < lastScrollY.current);
          lastScrollY.current = y;
        }}>
        {product.thumbnail ? (
          <Image
            source={{uri: product.thumbnail}}
            className="aspect-square w-full"
            resizeMode="contain"
          />
        ) : null}
        <View className="rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <ProductInfo
            product={product}
            source={source}
            productId={productId}
            isUserLogin={isLogin}
          />
        </View>
        {/* web 순서: 카톡방 → 쿠팡 고지 → 만료 경고 → 가격추이. 광고는 앱에서 제거. */}
        <KakaoOpenChatPrompt />
        <AffiliateNotice mallName={product.mallName} variant="coupang" />
        <ExpiredProductWarning product={product} onPressProduct={pushProduct} />
        <PriceHistorySection
          productId={productId}
          postedAt={product.postedAt}
          currentPrice={
            product.price
              ? Number(String(product.price).replace(/[^0-9.]/g, '')) || null
              : null
          }
        />
        {/* 유저 직접 등록 상품은 크롤링 출처가 없어 커뮤니티 반응도 없다(web 과 동일). */}
        {product.uploaderType !== UploaderType.User ? (
          <CommunityReaction productId={productId} isUserLogin={isLogin} />
        ) : null}
        <Hr />
        <TossDetailImages images={source.toss?.images} />
        <CommentSection
          productId={productId}
          myUserId={myUserId}
          onPressMore={() =>
            navigation.navigate(tabStackNavigations.COMMENTS, {productId})
          }
        />
        <Hr />
        <ProductCarouselSection
          title="다른 고객이 함께 본 상품"
          products={togetherViewed}
          isPending={isTogetherViewedPending}
          isError={isTogetherViewedError}
          onRetry={refetchTogetherViewed}
          onPressProduct={pushProduct}
        />
        <ProductCarouselSection
          title={`${product.categoryName ?? '기타'} 인기 상품`}
          products={categoryPopular?.filter(
            p => String(p.id) !== String(product.id),
          )}
          isPending={isCategoryPending}
          isError={isCategoryError}
          onRetry={refetchCategory}
          onPressProduct={pushProduct}
        />
        <AffiliateNotice mallName={product.mallName} variant="general" />
        <View className="h-[24px] bg-gray-100" />
      </ScrollView>
      <BottomCTA
        product={product}
        isUserLogin={isLogin}
        showTopButton={showTopButton}
        onPressTop={() => scrollRef.current?.scrollTo({y: 0, animated: true})}
      />
      {shareSheet}
    </View>
  );
}

/**
 * 섹션 구분선. web 의 Hr 과 같은 8px 회색 바.
 * web 은 바 앞 섹션이 자기 아래 여백(mb)을 갖는데 내 섹션들은 위 여백(pt)만
 * 있어 바 위쪽이 붙어 보였다. 바에 위 여백을 줘서 양쪽을 띄운다.
 */
function Hr() {
  return <View className="mt-7 h-[8px] bg-gray-100" />;
}

export {parseProductId};
