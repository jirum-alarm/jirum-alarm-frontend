import React, {useEffect} from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';

import {ProductQueries} from '@/entities/product/product.queries';
import {ProductService} from '@/shared/api/product/product.service';
import PressableScale from '@/shared/components/PressableScale';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {peekPushOrigin} from '@/shared/lib/analytics/push-origin';
import {openInAppBrowser} from '@/shared/lib/navigation';
import {resolveEntryScreen} from '@/shared/lib/navigation/entry-screen';

const SOURCE = 'coupang_search_cta';

// 새 딜은 가격이 아직 살아 있으니 «지금 얼마일까»가 아니라 쿠팡과 견줘 보라고 권한다(web 과 같은 문구).
const COPY = {
  aged: {title: '이 상품, 지금은 얼마일까요?', action: '가격 보기'},
  nolink: {title: '쿠팡에서도 찾아볼까요?', action: '쿠팡 보기'},
} as const;

/**
 * 딜 상세의 「쿠팡에서 지금 가격 보기」 — 오래된 딜(coupang_search_cta_v1)·링크 없는 새 딜(nolink_coupang_cta_v1).
 * web CoupangSearchCta 와 같은 자리·문구. 서버가 실험군·대상 딜에만 링크를 돌려주고, 문구는 kind 로 고른다.
 * 구매 버튼과 같이 인앱 브라우저로 연다.
 */
export default function CoupangSearchCta({productId}: {productId: number}) {
  const navigation = useNavigation();
  const {data: cta} = useQuery(ProductQueries.coupangSearchCta({productId}));

  useEffect(() => {
    if (!cta) return;
    void ProductService.collectPriceContextImpression({
      productId,
      source: SOURCE,
      detail: 'coupang_search:shown',
    }).catch(() => {});
  }, [cta, productId]);

  if (!cta) return null;
  const copy = COPY[cta.kind] ?? COPY.aged;

  const handlePress = () => {
    Analytics.track('purchase_link_click', {
      product_id: String(productId),
      click_url: cta.url,
      monetized: true,
      profit_provider: 'coupang',
      click_source: SOURCE,
    });
    void ProductService.collectPurchaseClick({
      productId,
      source: SOURCE,
      entry: resolveEntryScreen(
        navigation.getState(),
        navigation.getParent()?.getState(),
      ),
      // 이것도 구매 클릭이다 — 푸시로 들어온 상세면 nid 를 같이(BottomCTA 와 같은 귀속).
      nid: peekPushOrigin(productId),
    }).catch(() => {});
    openInAppBrowser(cta.url);
  };

  return (
    <View className="px-5 pt-7">
      <PressableScale
        onPress={handlePress}
        accessibilityRole="link"
        accessibilityLabel={`쿠팡에서 ${cta.query} 가격 보기`}
        className="flex-row items-center gap-x-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold text-gray-800">
            {copy.title}
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
            쿠팡에서 ‘{cta.query}’ 검색 결과 보기
          </Text>
        </View>
        <View className="shrink-0 rounded-full border border-gray-300 bg-white px-3 py-1.5">
          <Text className="text-xs font-semibold text-gray-700">
            {copy.action}
          </Text>
        </View>
      </PressableScale>
      <Text className="mt-1.5 px-1 text-11 text-gray-400">
        쿠팡 파트너스 활동으로 지름알림이 일정 수수료를 받아요.
      </Text>
    </View>
  );
}
