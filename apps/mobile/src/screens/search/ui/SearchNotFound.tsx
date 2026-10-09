import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useQuery} from '@tanstack/react-query';

import {CarouselList} from '@/entities/home/ui/DynamicProductList';
import {TrendingQueries} from '@/entities/trending/api/trending.queries';
import AlarmIllustError from '@/shared/components/icons/AlarmIllustError';
import {Analytics} from '@/shared/lib/analytics/ga4';

import KeywordAlertButton from '@/features/keyword-prompt/ui/KeywordAlertButton';

import SectionHeader from '@/shared/components/ui/SectionHeader';

/**
 * 검색 결과가 없을 때. web: widgets/search/ui/ProductNotFound.tsx
 *
 * ★옮기지 않은 web 분기 2개(앱에서 도달 불가):
 *   - `useIsLoggedIn`/`checkAndRedirect` 로그인 게이트 — `RootNavigator` 가 앱
 *     전체를 로그인 뒤에 두므로 비로그인은 이 화면에 닿지 못한다.
 *   - 그 게이트 직전에 쏘던 `keyword_intent` 이벤트 — 비로그인 전용 측정이라
 *     앱에선 절대 발화하지 않는다(옮기면 0 건짜리 죽은 코드).
 *
 * ★`search_no_result` 는 **인수했다**. web 은 GTM dataLayer 로 쏘고 GTM 이
 * Mixpanel 로 위임하는데, 네이티브 화면엔 GTM DOM 트리거가 닿지 않아 그대로
 * 두면 "검색했는데 결과가 없었다"는 신호가 앱에서만 영구히 사라진다
 * (shared/lib/analytics/mixpanel.ts 주석과 같은 이유).
 */
export default function SearchNotFound({
  keyword,
  onPressProduct,
  bottomInset,
}: {
  keyword: string;
  onPressProduct: (id: number) => void;
  bottomInset: number;
}) {
  const {data: hotDeals} = useQuery(TrendingQueries.recommended());

  useEffect(() => {
    Analytics.track('search_no_result', {keyword});
  }, [keyword]);

  return (
    <ScrollView
      className="flex-1 bg-white"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        {paddingBottom: 24 + bottomInset},
      ]}>
      <View className="items-center px-5 pb-8">
        {/*
          ⚠️web 은 `ErrorIllust`(240x240, 그라디언트 3개)를 쓴다. 그 SVG 는
          react-native-svg 로 손번역해야 하는데(Defs·LinearGradient·RadialGradient)
          잘못 옮겨도 타입·테스트가 못 잡는다 → 이미 옮겨져 있는 같은 계열
          빈 상태 일러스트를 쓴다. 정확한 그림이 필요하면 별도로 포팅할 것.
        */}
        <AlarmIllustError />
        <Text className="pt-4 pb-2 text-2xl font-semibold text-gray-900">
          검색 결과가 없어요
        </Text>
        <Text className="text-center text-gray-500">
          {'지금은 없지만, 올라오면 바로 알려드릴게요'}
        </Text>
      </View>

      <View className="items-center pb-16">
        {/*
          검색한 단어 그대로 바로 건다 — 예전엔 빈 키워드 화면으로 보내 다시 치게 했다.
          (2~20자 밖이면 키워드로 못 걸어 버튼이 숨는다.)
        */}
        <KeywordAlertButton keyword={keyword} variant="cta" />
      </View>

      {hotDeals && hotDeals.length > 0 ? (
        <View style={styles.section}>
          {/* web: hr + '오늘 가장 인기 있는 핫딜' + 더보기 */}
          <View className="mx-5 border-t border-gray-300" />
          {/*
            ★web 의 '더보기'(→ /trending)는 옮기지 않았다. 검색 스택에서
            발견 탭으로 건너뛰면 사용자가 쌓아온 검색 한 판이 탭 전환으로
            사라진다(뒤로가기로 돌아올 수 없다). 캐러셀에서 상품을 바로
            누르는 길은 그대로 남는다.
          */}
          <SectionHeader className="h-11" title="오늘 가장 인기 있는 핫딜" />
          <CarouselList products={hotDeals} onPressProduct={onPressProduct} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /** web `pt-11` */
  content: {paddingTop: 44},
  section: {gap: 8},
});
