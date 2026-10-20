import React, {useMemo} from 'react';
import {RECOMMENDED_KEYWORD_COUNT} from '@jirum/domain/search';
import {View} from 'react-native';
import PressableOpacity from '@/shared/components/PressableOpacity';
import {Text} from '@/shared/components/ui/Text/AppText';

import SectionHeader from '@/shared/components/ui/SectionHeader';
import {pickRecommendedKeywords} from '@/entities/keyword-hub/lib/keyword-hub';
import {useKeywordHubs} from '@/entities/keyword-hub/model/useKeywordHubs';

/**
 * 추천 검색어 5개 — 공개 키워드 허브에서 뽑는다. web: widgets/search/ui/RecommendationKeywords.tsx
 *
 * 2026-10-14까지는 웹·앱이 같은 하드코딩 25개를 들고 있었다(글자까지 같은지 테스트가 대조했다). 이제 둘 다 서버
 * 등록부를 읽어 같은 목록이 보장된다. 허브는 「30일 딜이 충분하고 제목이 그 상품」인 것만 판정해 둔 목록이라 누르면
 * 결과가 비거나 엉뚱할 일이 적고, 결과 위에 허브 요약 줄이 뜬다. 목록을 못 받으면 섹션을 숨긴다.
 */
export {RECOMMENDED_KEYWORD_COUNT};

export default function RecommendedKeywords({
  onSelect,
}: {
  onSelect: (keyword: string) => void;
}) {
  const {data: hubs} = useKeywordHubs();
  /** 목록이 오면 한 번만 섞는다. 매 렌더 새로 섞으면 키워드가 타이핑 도중에 계속 바뀐다. */
  const keywords = useMemo(
    () =>
      hubs
        ? pickRecommendedKeywords(hubs, RECOMMENDED_KEYWORD_COUNT, Math.random)
        : [],
    [hubs],
  );
  if (keywords.length === 0) return null;

  return (
    <View>
      <SectionHeader className="h-11" title="추천 검색어" />
      <View className="flex-row flex-wrap gap-2 px-5">
        {keywords.map(keyword => (
          <PressableOpacity
            key={keyword}
            onPress={() => onSelect(keyword)}
            accessibilityRole="button"
            accessibilityLabel={keyword}
            className="rounded-full bg-gray-50 px-3 py-2">
            <Text className="text-sm text-gray-900">{keyword}</Text>
          </PressableOpacity>
        ))}
      </View>
    </View>
  );
}
