import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {ActivityIndicator, ScrollView, Text, View} from 'react-native';
import {SystemBars} from 'react-native-edge-to-edge';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  OrderOptionType,
  ProductOrderType,
  UploaderType,
} from '@/shared/api/gql/graphql';
import {ProductQueries} from '@/entities/product/product.queries';
import ProductCarouselSection from '@/shared/components/product/ProductCarouselSection';
import Thumbnail from '@/shared/components/product/Thumbnail';
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
import {isFromTossPath} from '@/entities/home/lib/toss';
import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {useAuth} from '@/shared/hooks/useAuth';
import {goTabHome, openSearch} from '@/shared/lib/navigation/search-flow';
import {useWebviewContext} from '@/provider/WebViewRefProvider';

import ProductDetailWebViewScreen from './ProductDetailWebViewScreen';
import {parseSourceData} from './model/types';
import {formatDealAgeNotice} from './lib/price-signals';
import BottomCTA from './ui/BottomCTA';
import ProductInfo from './ui/ProductInfo';
import AffiliateNotice from './ui/AffiliateNotice';
import ExpiredProductWarning from './ui/ExpiredProductWarning';
import {
  DetailHeaderActions,
  DetailHeaderBackButton,
  DetailHeaderTitle,
} from './ui/ProductDetailHeader';
import ShareSheet from './ui/ShareSheet';
import KakaoOpenChatPrompt from './ui/KakaoOpenChatPrompt';
import TossDetailImages from './ui/TossDetailImages';
import ViewerCount, {
  MIN_VIEWER_COUNT,
  VIEWER_COUNT_HEIGHT,
} from './ui/ViewerCount';
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
  return (
    <NativeDetail
      productId={productId}
      hidePrice={isFromTossPath(props.route.params.path)}
    />
  );
}

function NativeDetail({
  productId,
  hidePrice,
}: {
  productId: number;
  hidePrice: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  // 가격 추이 섹션의 스크롤 위치 — 판정 카드 "기준 보기"가 여기로 간다.
  const priceHistoryY = useRef<number | null>(null);
  const [showTopButton, setShowTopButton] = useState(false);
  // 조회수 띠가 꽉 찬 띠 → 떠 있는 알약으로 바뀌는 기준(web 의 센티널 translate-y-7 = 28px).
  const [viewerCollapsed, setViewerCollapsed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const navigation = useNavigation<DetailNavigationProp>();
  const {getWebViewRef} = useWebviewContext();
  const {
    data: product,
    isPending,
    isError,
    refetch,
  } = useQuery(ProductQueries.info({id: productId}));

  // 가이드 메타행(쇼핑몰 아래)을 상세와 같이 받는다. ProductGuideMetaRows 안에서만
  // 받으면 상세가 그려진 뒤에 도착해 행이 "없다가 생기며" 아래 내용을 밀어낸다.
  // 여기서 먼저 걸어두면 같은 queryKey 라 화면이 뜰 때부터 채워져 있다.
  const {isPending: isGuidesPending} = useQuery(
    ProductQueries.guides({productId}),
  );
  // 가격 판정도 같은 이유로 먼저 건다. web 은 서버(page.tsx)가 받아 첫 HTML 에 박는다 —
  // 늦게 오면 가격 바로 아래 카드가 "없다가 생기며" 화면을 민다. 실패는 null(서비스가 삼킴).
  const {data: verdict, isPending: isVerdictPending} = useQuery({
    ...ProductQueries.priceVerdict({id: productId}),
    enabled: !hidePrice,
  });

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
      headerLeft: ({canGoBack}) => (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {canGoBack ? (
            <DetailHeaderBackButton onPress={() => navigation.goBack()} />
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

  if (isPending || isGuidesPending || (!hidePrice && isVerdictPending)) {
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
  const ageNotice = hidePrice
    ? null
    : formatDealAgeNotice(product.postedAt, product.isEnd);
  const showViewerCount = (product.viewCount ?? 0) >= MIN_VIEWER_COUNT;

  return (
    <View className="flex-1 bg-white">
      <SystemBars style="dark" hidden={false} />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{paddingBottom: 0}}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        stickyHeaderIndices={showViewerCount ? [0] : undefined}
        onScroll={e => {
          const y = e.nativeEvent.contentOffset.y;
          setShowTopButton(y > 200 && y < lastScrollY.current);
          setViewerCollapsed(y > 28);
          lastScrollY.current = y;
        }}>
        {showViewerCount ? (
          <ViewerCount
            count={product.viewCount ?? 0}
            collapsed={viewerCollapsed}
          />
        ) : null}
        {/* web ProductDetailImage 와 같이 webp → 원본 → 카테고리 대체 그림 순서.
            CDN 은 webp 만 갖고 있어 원본 확장자 URL 은 403 이다. */}
        <View className="aspect-square w-full bg-gray-50">
          <Thumbnail
            uri={product.thumbnail}
            categoryId={product.categoryId}
            resizeMode="cover"
          />
        </View>
        {/* web 처럼 카드가 이미지 아래쪽 24px 을 덮어 둥근 모서리 뒤로 이미지가 보인다. */}
        <View className="-mt-6 rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <ProductInfo
            product={product}
            source={source}
            productId={productId}
            isUserLogin={isLogin}
            hidePrice={hidePrice}
            verdict={verdict}
            onPressVerdictHistory={() => {
              if (priceHistoryY.current == null) return;
              // sticky 조회수 띠가 섹션 제목을 덮지 않게 그 높이만큼 덜 내린다.
              scrollRef.current?.scrollTo({
                y:
                  priceHistoryY.current -
                  (showViewerCount ? VIEWER_COUNT_HEIGHT : 0),
                animated: true,
              });
            }}
          />
          {/* web ProductPriceContext — 오래된 딜 안내. 모델 페이지 링크는 앱에서
              /deals 를 열지 않으므로(2026-09-09 결정) 뺐다. */}
          {ageNotice ? (
            <Text className="mx-5 mb-6 text-sm text-gray-500">{ageNotice}</Text>
          ) : null}
        </View>
        {/* web 순서: 카톡방 → 쿠팡 고지 → 만료 경고 → 가격추이. 광고는 앱에서 제거. */}
        <KakaoOpenChatPrompt />
        <AffiliateNotice mallName={product.mallName} variant="coupang" />
        <ExpiredProductWarning
          product={product}
          onPressProduct={pushProduct}
          // 하위 경로는 ProductDetailScreen 이 웹뷰로 넘긴다 — 탭 스택·검색 스택
          // 어디서 열려도 같은 라우트(DETAIL)로 간다(검색 스택엔 WEBVIEW 가 없다).
          onPressMore={() =>
            navigation.push(tabStackNavigations.DETAIL, {
              path: `/products/${productId}/related`,
            })
          }
        />
        {!hidePrice ? (
          <PriceHistorySection
            productId={productId}
            postedAt={product.postedAt}
            productTitle={product.title}
            productThumbnail={product.thumbnail}
            onPressProduct={pushProduct}
            onLayout={e => {
              priceHistoryY.current = e.nativeEvent.layout.y;
            }}
            currentPrice={
              product.price
                ? Number(String(product.price).replace(/[^0-9.]/g, '')) || null
                : null
            }
          />
        ) : null}
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
          trackingSource="together_viewed"
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
          trackingSource="category_popular"
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
