import React, {useRef, useState} from 'react';
import {Text, View} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';

import PressableScale from '@/shared/components/PressableScale';
import {ProductService} from '@/shared/api/product/product.service';
import {showToast} from '@/shared/lib/feedback';
import {PendingActionType} from '@/shared/lib/pending-action';
import {
  usePendingAction,
  useRequireLogin,
} from '@/shared/hooks/useRequireLogin';
import {cn} from '@/shared/lib/styling';

import {HomeQueries} from '../api/home.queries';

/**
 * 인기 키워드 추천 칩. web: widgets/home/ui/RecommendedKeywordSection.tsx
 * `under-10000`(만원이하템) 뒤에 들어간다.
 *
 * 게스트에게도 노출하고 누르면 로그인으로 보낸다 —
 * 홈 트래픽 대부분이 비로그인이라 여기서 막으면 모수가 안 는다(web 과 같은 판단).
 *
 * ★web 은 그라데이션 배경(bg-linear-to-b/srgb from-white to-[#eaf7d9])을 쓴다.
 * RN 은 CSS 그라데이션이 없다 — expo-linear-gradient 를 새로 넣기보다
 * 도착색 단색으로 둔다. 위아래가 흰 섹션이라 색 블록으로 튀지 않는 목적은 유지된다.
 * ponytail: 단색. 그라데이션이 꼭 필요해지면 그때 라이브러리.
 */

const MAX_CHIPS = 5;

export default function RecommendedKeywordSection() {
  const {data} = useQuery(HomeQueries.recommendedKeywords());
  const {requireLogin} = useRequireLogin();

  const [justAdded, setJustAdded] = useState<string[]>([]);
  const inFlight = useRef<string | null>(null);

  const {mutate: addKeyword, isPending} = useMutation({
    mutationFn: (keyword: string) =>
      ProductService.addNotificationKeyword({
        keyword,
        fromRecommendation: true,
      }),
    onSuccess: () => {
      const added = inFlight.current;
      showToast.info(
        added
          ? `'${added}' 키워드 알림을 등록했어요.`
          : '키워드 알림을 등록했어요.',
      );
    },
    onError: (error: unknown) => {
      // 낙관적으로 켜둔 체크를 되돌린다.
      const failed = inFlight.current;
      if (failed) setJustAdded(prev => prev.filter(k => k !== failed));
      // 서버가 '이미 등록된 키워드', '최대 20개 초과' 같은 구체적 이유를 준다.
      const message =
        error instanceof Error ? error.message : '키워드 저장에 실패했습니다.';
      showToast.info(message || '키워드 저장에 실패했습니다.');
    },
  });

  const keywords = data ?? [];

  /**
   * ★표시 목록은 추천이 처음 도착한 시점에 고정한다.
   * 목록을 따라가게 두면 등록한 칩이 사라지고 뒤 키워드가 앞으로 밀려와
   * 뭘 눌렀는지도 성공했는지도 알 수 없다(web 과 동일한 이유).
   */
  const pinned = useRef<string[] | null>(null);
  if (pinned.current === null && keywords.length > 0) {
    pinned.current = keywords.slice(0, MAX_CHIPS);
  }
  const chips = pinned.current ?? [];

  const runAdd = (keyword: string) => {
    inFlight.current = keyword;
    setJustAdded(prev => (prev.includes(keyword) ? prev : [...prev, keyword]));
    addKeyword(keyword);
  };

  // 게스트가 칩을 눌러 로그인하고 돌아왔으면 그 키워드를 이어서 등록한다.
  // ★훅이므로 아래 early return 보다 위에 있어야 한다.
  usePendingAction<string>(
    PendingActionType.NOTIFICATION_KEYWORD_ADD,
    keyword => {
      if (keyword) runAdd(keyword);
    },
  );

  // 추천이 없으면 섹션을 통째로 숨긴다 — 홈은 딜을 보러 오는 곳이라
  // 빈 박스나 스켈레톤이 오히려 노이즈다(TossHomeSection 과 같은 판단).
  if (chips.length === 0) return null;

  const handleSelect = (keyword: string) => {
    if (isPending || justAdded.includes(keyword)) return;
    if (requireLogin(PendingActionType.NOTIFICATION_KEYWORD_ADD, keyword))
      return;
    runAdd(keyword);
  };

  return (
    <View className="bg-[#eaf7d9] px-5 py-7">
      <Text className="text-center text-[15px] font-semibold text-gray-900">
        인기 키워드로 알림 받아보세요!
      </Text>
      <View className="mt-4 flex-row flex-wrap justify-center gap-2">
        {chips.map(keyword => {
          const added = justAdded.includes(keyword);
          return (
            <PressableScale
              key={keyword}
              disabled={isPending || added}
              onPress={() => handleSelect(keyword)}
              accessibilityRole="button"
              accessibilityState={{disabled: added}}
              accessibilityLabel={
                added
                  ? `${keyword} 키워드 알림 등록됨`
                  : `${keyword} 키워드 알림 등록`
              }
              // 터치 타깃 44px 확보(web 은 before 의사요소로 채운다).
              hitSlop={{top: 4, bottom: 4}}
              className={cn(
                'flex-row items-center gap-2 rounded-full border px-4 py-2',
                added
                  ? 'border-primary-200 bg-primary-50'
                  : 'border-gray-100 bg-white',
              )}>
              <Text
                className={cn(
                  'text-sm font-medium',
                  added ? 'text-primary-700' : 'text-gray-900',
                )}>
                {keyword}
              </Text>
              {/* ★기호 자리를 고정한다. web 은 `+`(text-base)와 `✓`(text-sm)로
                  크기가 다른데, RN 에선 그게 칩 높이·폭을 바꿔서 등록하는 순간
                  칩이 커졌다 작아진다(사용자 지적). 폭·줄높이를 박아
                  기호만 갈아끼운다. */}
              <Text
                style={{width: 12, lineHeight: 18, textAlign: 'center'}}
                className={cn(
                  'text-sm',
                  added ? 'text-primary-600' : 'text-gray-400',
                )}>
                {added ? '✓' : '+'}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
