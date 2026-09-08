import React, {useMemo} from 'react';
import {Pressable, Text, View} from 'react-native';

import SectionTitle from './SectionTitle';

/**
 * 추천 검색어. web: widgets/search/ui/RecommendationKeywords.tsx
 *
 * 목록은 web 과 **글자까지 같아야** 한다 — 같은 서비스에서 웹과 앱이 다른
 * 추천어를 내놓으면 둘 중 하나가 낡은 것처럼 보인다(테스트가 대조한다).
 */
export const RECOMMENDED_KEYWORDS = [
  '쌀',
  '라면',
  '모니터',
  '스팸',
  '헤드셋',
  '청소기',
  '신발',
  '의자',
  '캠핑',
  '칫솔',
  '고기',
  '비비고',
  '시리얼',
  '물티슈',
  '생수',
  '컴퓨터',
  '마우스',
  '키보드',
  '닭가슴살',
  '사이다',
  '맥북',
  '갤럭시',
  '아이폰',
  '콜라',
  '치킨',
] as const;

/** web 과 같이 5개만 무작위로 보여준다. */
export const RECOMMENDED_KEYWORD_COUNT = 5;

export default function RecommendedKeywords({
  onSelect,
}: {
  onSelect: (keyword: string) => void;
}) {
  /**
   * ★web 은 `KEYWORDS.sort(...)` 로 **모듈 배열을 제자리 정렬**한다(원본이
   * 섞인다). 여기선 복사본을 섞는다 — 상수를 건드리면 테스트가 읽는 순서까지
   * 바뀐다.
   *
   * useMemo 로 마운트에 한 번만 뽑는다. 매 렌더 새로 섞으면 키워드가 타이핑
   * 도중에 계속 바뀐다(web 은 useEffect+state 로 같은 효과를 낸다).
   */
  const keywords = useMemo(
    () =>
      [...RECOMMENDED_KEYWORDS]
        .sort(() => 0.5 - Math.random())
        .slice(0, RECOMMENDED_KEYWORD_COUNT),
    [],
  );

  return (
    <View>
      <SectionTitle title="추천 검색어" />
      <View className="flex-row flex-wrap gap-2 px-5">
        {keywords.map(keyword => (
          <Pressable
            key={keyword}
            onPress={() => onSelect(keyword)}
            accessibilityRole="button"
            accessibilityLabel={keyword}
            className="rounded-full bg-gray-50 px-3 py-2"
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Text className="text-sm text-gray-900">{keyword}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
