import React, {useEffect} from 'react';
import {Pressable, View} from 'react-native';
import {StackActions, useNavigation} from '@react-navigation/native';

import {Text} from '@/shared/components/ui/Text/AppText';
import {
  buildKeywordHubFacts,
  findKeywordHubForQuery,
  formatHubCount,
} from '@/entities/keyword-hub/lib/keyword-hub';
import {useKeywordHubs} from '@/entities/keyword-hub/model/useKeywordHubs';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {text} from '@jirum/design-system/recipes';

/**
 * 검색어가 키워드 허브 자체일 때("삼다수", "플스5") 결과 위에 30일 요약 한 줄 — "삼다수 핫딜 최근 30일 92건 ·
 * 30일 중 24일 · 주로 뽐뿌 24%". 얼마나 자주 올라오는지 알면 지금 살지 기다릴지 가늠할 수 있다.
 * 누르면 허브 화면으로 — web SearchKeywordHubCard(허브 페이지로 가는 카드)와 같은 숫자·같은 계측
 * (keyword_hub_card_view/click, placement=search_bar).
 */
export default function SearchKeywordHubSummary({keyword}: {keyword: string}) {
  const navigation = useNavigation();
  const {data: hubs} = useKeywordHubs();
  const hub = hubs ? findKeywordHubForQuery(keyword, hubs) : undefined;
  const visible = !!hub && hub.recentDealCount > 0;
  const slug = hub?.slug;

  useEffect(() => {
    if (!visible || !slug) return;
    Analytics.track('keyword_hub_card_view', {
      keyword: slug,
      placement: 'search_bar',
    });
  }, [visible, slug]);

  if (!hub || !visible) return null;

  const parts = [
    `최근 30일 ${formatHubCount(hub)}`,
    ...buildKeywordHubFacts(hub),
  ];
  return (
    <View className="px-5 pb-2">
      <Pressable
        onPress={() => {
          Analytics.track('keyword_hub_card_click', {
            keyword: hub.slug,
            placement: 'search_bar',
          });
          // 허브는 루트 스택 화면이다 — 검색 스택엔 없는 이름이라 push 가 부모(루트)로 올라가 처리된다.
          navigation.dispatch(
            StackActions.push(tabStackNavigations.KEYWORD_HUB, {
              slug: hub.slug,
              name: hub.name,
            }),
          );
        }}
        accessibilityRole="link"
        accessibilityLabel={`${hub.name} 핫딜 모아보기`}
        hitSlop={8}
        style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
        <Text className={text.muted} numberOfLines={2}>
          <Text className="font-semibold text-gray-900">{`${hub.name} 핫딜 `}</Text>
          {`${parts.join(' · ')} ›`}
        </Text>
      </Pressable>
    </View>
  );
}
