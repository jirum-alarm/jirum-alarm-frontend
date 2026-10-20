import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {HELP_PATH} from '@/constants/env';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {peekPushOrigin} from '@/shared/lib/analytics/push-origin';
import {SystemBars} from 'react-native-edge-to-edge';
import {StackActions, useNavigation} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  type HotDealType,
  OrderOptionType,
  ProductOrderType,
  UploaderType,
} from '@/shared/api/gql/graphql';
import {ProductQueries} from '@/entities/product/product.queries';
import {peekDetailPreview} from '@/entities/product/prefetch-detail';
import ProductCarouselSection from '@/entities/product/ui/ProductCarouselSection';
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
import type {ProductFlowParamList} from '@/shared/lib/navigation/param-list';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {isNotFoundError} from '@/shared/lib/client/http-client';
import {isFromTossPath} from '@/entities/home/lib/toss';
import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {useAuth} from '@/entities/auth/useAuth';
import {usePullRefresh} from '@/shared/hooks/usePullRefresh';
import {goTabHome, openSearch} from '@/shared/lib/navigation/search-flow';
import {pushProductDetail} from '@/shared/lib/navigation/detail-chain';
import {buildProductShareDescription} from '@/shared/lib/share';
import {noteDealViewed} from '@/shared/lib/store-review';
import {hotdealTextMap} from '@/shared/components/product/HotdealBadge';
import {useWebviewContext} from '@/provider/WebViewRefProvider';

import ProductDetailWebViewScreen from './ProductDetailWebViewScreen';
import RelatedProductsScreen from './RelatedProductsScreen';
import {parseSourceData} from './model/types';
import {dealFreshnessAt, formatDealAgeNotice} from './lib/price-signals';
import BottomCTA from './ui/BottomCTA';
import ProductDetailSkeleton from './ui/ProductDetailSkeleton';
import ProductInfo from './ui/ProductInfo';
import AffiliateNotice from './ui/AffiliateNotice';
import AlertReasonLine from './ui/AlertReasonLine';
import ExpiredProductWarning from './ui/ExpiredProductWarning';
import MissingDealView from './ui/MissingDealView';
import LiveAlternativeDeals from './ui/LiveAlternativeDeals';
import {
  DetailHeaderActions,
  DetailHeaderBackButton,
  DetailHeaderTitle,
} from './ui/ProductDetailHeader';
import ShareSheet from './ui/ShareSheet';
import KakaoOpenChatPrompt from './ui/KakaoOpenChatPrompt';
import TossDetailImages from './ui/TossDetailImages';
import DetailBand from './ui/DetailBand';
import ViewerCount, {MIN_VIEWER_COUNT} from './ui/ViewerCount';
import CommunityReaction from '@/features/community-reaction/ui/CommunityReaction';
import PressableOpacity from '@/shared/components/PressableOpacity';
import {findKeywordHubsForTitle} from '@/entities/keyword-hub/lib/keyword-hub';
import {useKeywordHubs} from '@/entities/keyword-hub/model/useKeywordHubs';

type Props = NativeStackScreenProps<
  ProductFlowParamList,
  typeof tabStackNavigations.DETAIL
>;

type DetailNavigationProp = Props['navigation'];

/** 종료 딜 블록 머리(제목·안내 ~60px)에 카드 첫 줄 일부가 보이면 노출 — 블록 위에서 이만큼 내려온 지점. */
const EXPIRED_FIRST_ROW_PX = 160;

/** `/products/123` 만 네이티브가 맡는다. 하위 경로(`/comment` 등)는 웹뷰로 넘긴다. */
function parseProductId(path: string): number | null {
  const pathname = path.split(/[?#]/)[0];
  const matched = pathname.match(/^\/products\/(\d+)\/?$/);
  return matched ? Number(matched[1]) : null;
}

/** `/products/123/related` — 관련 상품도 네이티브(그리드 하나라 웹뷰를 띄울 이유가 없다). */
function parseRelatedProductId(path: string): number | null {
  const pathname = path.split(/[?#]/)[0];
  const matched = pathname.match(/^\/products\/(\d+)\/related\/?$/);
  return matched ? Number(matched[1]) : null;
}

export default function ProductDetailScreen(props: Props) {
  const productId = parseProductId(props.route.params.path);
  const relatedId = parseRelatedProductId(props.route.params.path);

  if (relatedId !== null) {
    return <RelatedProductsScreen productId={relatedId} />;
  }

  // 파싱 실패·하위 경로는 기존 웹뷰가 그대로 처리한다(라우팅 구멍 방지).
  if (productId === null) {
    return <ProductDetailWebViewScreen {...props} />;
  }
  return (
    <NativeDetail
      productId={productId}
      hidePrice={isFromTossPath(props.route.params.path)}
      path={props.route.params.path}
    />
  );
}

function NativeDetail({
  productId,
  hidePrice,
  path,
}: {
  productId: number;
  hidePrice: boolean;
  /** 들어온 URL(쿼리 포함) — 알림 utm 으로 «왜 왔나» 한 줄을 단다. */
  path: string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const [scrollFlags] = useState(createScrollFlags);
  // 근거 블록 「근거 보기」가 내려갈 섹션 위치 — 가격 근거는 가격 추이, 사람 근거는 커뮤니티 반응.
  const priceHistoryY = useRef<number | null>(null);
  const communityY = useRef<number | null>(null);
  // 종료 딜 '최신 핫딜' 블록 — 첫 줄이 화면에 들어오면 노출로 센다(블록이 기록). 한 번만 state 를 바꾼다.
  const expiredBlockY = useRef<number | null>(null);
  const viewportHeight = useRef(0);
  const [expiredSeen, setExpiredSeen] = useState(false);
  const checkExpiredSeen = (scrollY: number) => {
    if (expiredSeen || expiredBlockY.current == null || !viewportHeight.current)
      return;
    if (
      scrollY + viewportHeight.current >
      expiredBlockY.current + EXPIRED_FIRST_ROW_PX
    )
      setExpiredSeen(true);
  };
  const [shareOpen, setShareOpen] = useState(false);
  const navigation = useNavigation<DetailNavigationProp>();
  const {getWebViewRef} = useWebviewContext();
  const {
    data: product,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery(ProductQueries.info({id: productId}));

  // 당겨서 새로고침 — 상세 하위 쿼리(가격·판정·통계·함께 본 상품…)를 한 번에. 판매 종료·가격 변동 확인용.
  const queryClient = useQueryClient();
  const {refreshing, onRefresh} = usePullRefresh(() =>
    queryClient.invalidateQueries({
      queryKey: ProductQueries.keys.detail(productId),
    }),
  );

  // 가이드 메타행(쇼핑몰 아래)을 상세와 같이 받는다. ProductGuideMetaRows 안에서만
  // 받으면 상세가 그려진 뒤에 도착해 행이 "없다가 생기며" 아래 내용을 밀어낸다.
  // 여기서 먼저 걸어두면 같은 queryKey 라 화면이 뜰 때부터 채워져 있다.
  const {isPending: isGuidesPending} = useQuery(
    ProductQueries.guides({productId}),
  );
  // 근거(왜 핫딜인지)도 같은 이유로 먼저 건다. web 은 서버(page.tsx)가 받아 첫 HTML 에 박는다 —
  // 늦게 오면 가격 바로 아래 블록이 "없다가 생기며" 화면을 민다. 실패는 null(서비스가 삼킴).
  // 토스 유입(hidePrice)도 받는다 — 블록은 안 그려도 정보 표에서 뺄 행(hiddenGuideIds)을 쓴다(web 과 같다).
  const {data: evidence, isPending: isEvidencePending} = useQuery(
    ProductQueries.dealEvidence({id: productId}),
  );

  const {data: myUserId} = useQuery(UserQueries.me());
  const {isMember: isLogin} = useAuth();

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

  // 카드를 누르면 같은 스택에 상세를 하나 더 쌓는다(웹 링크와 같은 동선). 이미 본 딜이면 되돌아가고,
  // 너무 깊어지면 오래된 상세를 걷는다(detail-chain).
  const pushProduct = useCallback(
    (id: number) => pushProductDetail(navigation, `/products/${id}`),
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
  // 이 상품 푸시를 막 눌러 들어왔으면 그 nid 를 싣는다 — 발송 → 열람을 한 키로 잇는다(push-origin).
  const collectedRef = useRef<number | null>(null);
  useEffect(() => {
    if (collectedRef.current === productId) return;
    collectedRef.current = productId;
    noteDealViewed();
    void ProductService.collectProduct({
      productId,
      source: 'app_detail',
      nid: peekPushOrigin(productId),
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
      description={buildProductShareDescription({
        price: product?.price,
        mallName: product?.mallName,
        badge: product?.hotDealType
          ? hotdealTextMap[product.hotDealType as HotDealType]
          : null,
        isEnd: product?.isEnd,
        hidePrice,
      })}
      imageUrl={product?.thumbnail ?? undefined}
    />
  );

  const {data: hubList} = useKeywordHubs();

  // 지워진 딜 — 가이드·근거 쿼리가 재시도로 늦게 끝나도 기다리지 않고 바로 알린다.
  if (isNotFoundError(error)) {
    return (
      <MissingDealView
        onPressHome={() => goTabHome(navigation)}
        onPressSearch={() => openSearch(navigation)}
      />
    );
  }

  if (isPending || isGuidesPending || isEvidencePending) {
    return (
      <>
        <ProductDetailSkeleton preview={peekDetailPreview(productId)} />
        {shareSheet}
      </>
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
    : formatDealAgeNotice(dealFreshnessAt(product), product.isEnd);
  const showViewerCount = (product.viewCount ?? 0) >= MIN_VIEWER_COUNT;
  const keywordHubs = hubList
    ? findKeywordHubsForTitle(product.title, hubList)
    : [];

  return (
    <View className="flex-1 bg-white">
      <SystemBars style="auto" hidden={false} />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{paddingBottom: 0}}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onLayout={e => {
          viewportHeight.current = e.nativeEvent.layout.height;
          checkExpiredSeen(lastScrollY.current);
        }}
        onScroll={e => {
          const y = e.nativeEvent.contentOffset.y;
          checkExpiredSeen(y);
          // ★상세 state 가 아니라 작은 store 에 쓴다 — 방향이 바뀔 때마다 상세 전체
          // (차트·댓글·캐러셀)가 다시 그려져 스크롤 직후 탭이 한 박자 늦었다.
          scrollFlags.set({
            showTopButton: y > 200 && y < lastScrollY.current,
          });
          lastScrollY.current = y;
        }}>
        {/* web ProductDetailImage 와 같이 webp → 원본 → 카테고리 대체 그림 순서.
            CDN 은 webp 만 갖고 있어 원본 확장자 URL 은 403 이다. */}
        <View className="relative aspect-square w-full bg-gray-50">
          <Thumbnail
            uri={product.thumbnail}
            categoryId={product.categoryId}
            resizeMode="cover"
            full
          />
          {showViewerCount ? (
            <ViewerCount count={product.viewCount ?? 0} />
          ) : null}
        </View>
        {/* web 처럼 카드가 이미지 아래쪽 24px 을 덮어 둥근 모서리 뒤로 이미지가 보인다. */}
        <View className="-mt-6 rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <AlertReasonLine path={path} />
          <ProductInfo
            product={product}
            source={source}
            productId={productId}
            isUserLogin={isLogin}
            hidePrice={hidePrice}
            evidence={evidence}
            onPressEvidenceMore={target => {
              const y =
                target === 'priceHistory'
                  ? priceHistoryY.current
                  : communityY.current;
              if (y == null) return;
              scrollRef.current?.scrollTo({y, animated: true});
            }}
          />
          {/* web ProductPriceContext — 오래된 딜 안내. 모델 페이지 링크는 앱에서
              /deals 를 열지 않으므로(2026-09-09 결정) 뺐다. */}
          {ageNotice ? (
            <Text className="mx-5 mb-6 text-sm text-gray-500">{ageNotice}</Text>
          ) : null}
          {/* web ProductPriceContext 키워드 허브 링크 — 딜에서 한 층 위(「삼다수 핫딜」 모음)로. 제목 매칭은
              @jirum/domain 한 곳(서버 keyword-hub-match 와 같은 규칙). 목록이 없으면 안 보일 뿐이다. */}
          {keywordHubs.length > 0 ? (
            <View className="mx-5 mb-6 flex-row flex-wrap gap-x-3 gap-y-1">
              {keywordHubs.map(hub => (
                <PressableOpacity
                  key={hub.slug}
                  accessibilityRole="link"
                  hitSlop={6}
                  onPress={() => {
                    Analytics.track('keyword_hub_card_click', {
                      keyword: hub.slug,
                      placement: 'detail_price_context',
                    });
                    // 상세 스택 타입엔 허브가 없다 — 액션으로 보내 루트(탭) 스택이 받게 한다(아래 도움말 링크와 같은 길).
                    navigation.dispatch(
                      StackActions.push(tabStackNavigations.KEYWORD_HUB, {
                        slug: hub.slug,
                        name: hub.name,
                      }),
                    );
                  }}>
                  <Text className="text-sm text-gray-600">
                    {hub.name} 핫딜 더보기 →
                  </Text>
                </PressableOpacity>
              ))}
            </View>
          ) : null}
          {/* web ProductPriceContext 「지름알림이 가격을 판단하는 법」 — 근거 칸 밖에 둔다. 그 칸은 「답」 숨김
              실험(price_answer_holdout_v1)이 숨기므로 안에 넣으면 실험 군만 링크가 생긴다. 검색 스택에서 열려도
              WEBVIEW 는 루트 스택이 받는다(push 가 부모로 올라간다). */}
          {!hidePrice ? (
            <PressableOpacity
              accessibilityRole="link"
              className="mx-5 mb-6 self-start"
              hitSlop={8}
              onPress={() => {
                Analytics.track('help_link_click', {
                  placement: 'detail_price_context',
                });
                // 상세 스택 타입엔 WEBVIEW 가 없다(상세·댓글만) — 액션으로 보내 루트 스택이 받게 한다.
                navigation.dispatch(
                  StackActions.push(tabStackNavigations.WEBVIEW, {
                    uri: `${HELP_PATH}#evidence`,
                    title: '사용법 · 자주 묻는 질문',
                  }),
                );
              }}>
              <Text className="text-sm text-gray-500">
                지름알림이 가격을 판단하는 법 ›
              </Text>
            </PressableOpacity>
          ) : null}
        </View>
        {/* web 순서: 카톡방 → 쿠팡 고지 → (띠) 비교 → (띠) 가격추이 → (띠) 커뮤니티 반응. 광고는 앱에서 제거.
            띠는 조건부 섹션이 자기 안에 둔다(DetailBand) — 섹션이 없으면 띠도 없다. */}
        {/* 요약 아래 안내 묶음(web 의 gap-3 묶음) — 카드 사이는 gap 이 주고 카드엔 바깥 margin 을 두지 않는다.
            예전엔 카톡 카드 mb-4 + 띠 mt-7 로 띠 위가 44pt, 아래가 28pt 로 어긋났다(2026-10-15). */}
        <View className="gap-3">
          <KakaoOpenChatPrompt
            categoryId={product.categoryId}
            productId={Number(product.id)}
          />
          <AffiliateNotice mallName={product.mallName} variant="coupang" />
        </View>
        <View
          onLayout={e => {
            expiredBlockY.current = e.nativeEvent.layout.y;
            checkExpiredSeen(lastScrollY.current);
          }}>
          <ExpiredProductWarning
            product={product}
            seen={expiredSeen}
            onPressProduct={pushProduct}
            // 하위 경로도 같은 라우트(DETAIL) — 탭 스택·검색 스택 어디서 열려도 같다
            // (검색 스택엔 WEBVIEW 가 없다). /related 는 ProductDetailScreen 이 네이티브로 그린다.
            onPressMore={() =>
              navigation.push(tabStackNavigations.DETAIL, {
                path: `/products/${productId}/related`,
              })
            }
          />
          {/* 막 올라온 딜(7일 미만)엔 위 종료 딜 블록 대신 같은 상품·같은 라인의 다른 진행 중 딜(둘은 겹치지 않는다). */}
          <LiveAlternativeDeals
            product={product}
            seen={expiredSeen}
            onPressProduct={pushProduct}
          />
        </View>
        {!hidePrice ? (
          <PriceHistorySection
            productId={productId}
            postedAt={product.postedAt}
            productTitle={product.title}
            productThumbnail={product.thumbnail}
            onPressProduct={pushProduct}
            topDivider
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
          <>
            <DetailBand />
            <View
              onLayout={e => {
                communityY.current = e.nativeEvent.layout.y;
              }}>
              <CommunityReaction productId={productId} isUserLogin={isLogin} />
            </View>
          </>
        ) : null}
        <DetailBand />
        <TossDetailImages images={source.toss?.images} />
        <CommentSection
          productId={productId}
          myUserId={myUserId}
          onPressMore={() =>
            navigation.navigate(tabStackNavigations.COMMENTS, {productId})
          }
        />
        <DetailBand />
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
        <View className="h-6 bg-gray-100" />
      </ScrollView>
      <ScrollAwareBottomCTA
        flags={scrollFlags}
        product={product}
        isUserLogin={isLogin}
        onPressTop={() => scrollRef.current?.scrollTo({y: 0, animated: true})}
      />
      {shareSheet}
    </View>
  );
}

export {parseProductId};

type ScrollFlags = {showTopButton: boolean};

/** 상세 하나당 하나 — 스택에 상세가 여러 개 쌓여도 서로 섞이지 않게 인스턴스마다 만든다. */
function createScrollFlags() {
  let value: ScrollFlags = {showTopButton: false};
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next: ScrollFlags) {
      if (next.showTopButton === value.showTopButton) return;
      value = next;
      listeners.forEach(listener => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
type ScrollFlagsStore = ReturnType<typeof createScrollFlags>;

function useScrollFlags(flags: ScrollFlagsStore) {
  return useSyncExternalStore(flags.subscribe, flags.get);
}

function ScrollAwareBottomCTA({
  flags,
  ...props
}: Omit<React.ComponentProps<typeof BottomCTA>, 'showTopButton'> & {
  flags: ScrollFlagsStore;
}) {
  return (
    <BottomCTA {...props} showTopButton={useScrollFlags(flags).showTopButton} />
  );
}
