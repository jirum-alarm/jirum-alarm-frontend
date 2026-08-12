import React, {useCallback, useEffect, useRef} from 'react';
import {ActivityIndicator, Image, ScrollView, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
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
import {pushRecentViewedProduct} from '@/shared/lib/device/recent-viewed';
import type {TabStackParamList} from '@/navigations/tab/types';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {setTabBarVisible} from '@/shared/hooks/useTabBarVisibility';

import ProductDetailWebViewScreen from './ProductDetailWebViewScreen';
import {parseSourceData} from './model/types';
import BottomCTA from './ui/BottomCTA';
import ProductInfo from './ui/ProductInfo';
import AffiliateNotice from './ui/AffiliateNotice';
import ExpiredProductWarning from './ui/ExpiredProductWarning';
import ProductDetailHeader from './ui/ProductDetailHeader';
import KakaoOpenChatPrompt from './ui/KakaoOpenChatPrompt';
import TossDetailImages from './ui/TossDetailImages';
import CommunityReaction from '@/features/community-reaction/ui/CommunityReaction';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.DETAIL
>;

type DetailNavigationProp = Props['navigation'];

/** web ProductDetailPage 와 같은 방. */
const TALKROOM_LINK = 'https://open.kakao.com/o/gJZTWAAg';

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

/**
 * 지금 살아있는 상세 화면 수. 상세 A → 상세 B 로 갈 때 바텀바가 올라오지 않게 한다.
 *
 * ★ boolean 으로는 안 된다: 실행 순서가 (B focus → true) → (A cleanup → false) 라
 * A 의 cleanup 이 B 가 세운 값을 지워버린다. 카운터면 1 이 남아 정확하다.
 */
const detailFocusCount = {current: 0};

function NativeDetail({productId}: {productId: number}) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation<DetailNavigationProp>();
  const {
    data: product,
    isPending,
    isError,
    refetch,
  } = useQuery(ProductQueries.info({id: productId}));

  const {data: myUserId} = useQuery(UserQueries.me());

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

  // 웹뷰 화면과 달리 onNavigationStateChange 가 없으므로 직접 숨기고 되돌린다.
  // 안 하면 탭바가 하단 CTA 를 덮는다.
  useFocusEffect(
    useCallback(() => {
      detailFocusCount.current += 1;
      setTabBarVisible(false);
      // ★ cleanup 에서 무조건 true 로 되돌리면, 상세 A → 상세 B 로 갈 때
      // B 가 숨긴 직후 A 의 cleanup 이 다시 켜서 바텀바가 나타난다.
      // 다음 화면이 뜬 뒤에 판단하도록 미루고, 그때도 상세면 그대로 둔다.
      return () => {
        detailFocusCount.current = Math.max(0, detailFocusCount.current - 1);
        // 다음 화면의 focus 가 먼저 돌 수 있으므로 한 틱 뒤에 판단한다.
        setTimeout(() => {
          if (detailFocusCount.current === 0) setTabBarVisible(true);
        }, 0);
      };
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
      <ProductDetailHeader
        productId={productId}
        title={product.title}
        onBack={() => navigation.goBack()}
        onPressLogo={() => {
          // popToTop 은 이 탭 스택의 상세를 전부 걷어내고 루트(웹뷰)만 남긴다.
          // 상세가 여러 겹 쌓였어도 한 번에 정리된다.
          navigation.popToTop();
        }}
      />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        // 하단 여백은 아래 64px 회색 면(web 과 동일)이 담당한다. 여기서 또 주면 겹친다.
        contentContainerStyle={{paddingBottom: 0}}
        showsVerticalScrollIndicator={false}>
        {product.thumbnail ? (
          <Image
            source={{uri: product.thumbnail}}
            className="aspect-[4/3] w-full"
            resizeMode="contain"
          />
        ) : null}
        {typeof product.viewCount === 'number' && product.viewCount >= 10 ? (
          // web: bg-secondary-50 면에 h-[48px], 강조는 secondary-500.
          // (내가 흰 배경으로 지웠던 것 — 웹은 연한 파란 띠다)
          <View className="h-[48px] w-full items-center justify-center bg-secondary-50">
            <Text className="text-sm text-gray-700">
              <Text className="font-semibold text-secondary-500">
                {product.viewCount.toLocaleString()}명
              </Text>
              이 살펴본 상품
            </Text>
          </View>
        ) : null}
        <View className="rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <ProductInfo
            product={product}
            source={source}
            productId={productId}
            isUserLogin={!!myUserId}
          />
        </View>
        <AffiliateNotice mallName={product.mallName} variant="coupang" />
        <KakaoOpenChatPrompt href={TALKROOM_LINK} />
        <PriceHistorySection
          productId={productId}
          currentPrice={
            product.price
              ? Number(String(product.price).replace(/[^0-9.]/g, '')) || null
              : null
          }
        />
        {/* 유저 직접 등록 상품은 크롤링 출처가 없어 커뮤니티 반응도 없다(web 과 동일). */}
        {product.uploaderType !== UploaderType.User ? (
          <CommunityReaction productId={productId} />
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
        <ExpiredProductWarning product={product} onPressProduct={pushProduct} />
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
        {/* 제휴 고지는 콘텐츠 끝에. 쿠팡 상품이면 위 상단 배너가 대신 뜬다. */}
        <AffiliateNotice mallName={product.mallName} variant="general" />
        {/* web 은 CTA 위에 64px 회색 면을 둬 마지막 섹션이 버튼에 붙지 않게 한다. */}
        <View className="h-[64px] bg-gray-100" />
      </ScrollView>
      <BottomCTA
        product={product}
        isUserLogin={!!myUserId}
        onPressTop={() => scrollRef.current?.scrollTo({y: 0, animated: true})}
      />
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
