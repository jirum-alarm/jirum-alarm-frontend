import {addChip, text} from '@jirum/design-system/recipes';
import {KEYWORD_BOARD_COPY} from '@jirum/domain/keyword-board';
import React from 'react';
import {Pressable, View} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {HomeQueries} from '@/entities/home/api/home.queries';
import {
  invalidateMyKeywords,
  normalizeKeyword,
} from '@/entities/mypage/model/myKeywords';
import {MyPageService} from '@/shared/api/mypage';
import PressableScale from '@/shared/components/PressableScale';
import {Text} from '@/shared/components/ui/Text/AppText';
import {trackKeywordRegister} from '@/shared/lib/analytics/keyword-tracking';
import {requestPushPermissionIfNeeded} from '@/shared/lib/fcm/push-permission';
import {showToast} from '@/shared/lib/feedback';
import {cn} from '@/shared/lib/styling';

const MAX_CHIPS = 8;

/**
 * 「요즘 많이 받는 키워드」 — 누르면 그 자리에서 건다(내 키워드 화면 EmptyKeywords·첫 실행 시트와 같은 추천 목록).
 * 키워드 탭에서 등록하면 상황판에 그 키워드 카드가 바로 생긴다 — «걸자마자 최근 딜이 보인다»가 이 탭의 첫 경험.
 * 이미 건 키워드는 뺀다. 계측 keyword_register source=keyword_tab(web 과 같은 값). web RecommendedKeywordChips 와 짝.
 */
export default function RecommendedKeywordChips({
  registered,
  onRegister,
}: {
  registered: Set<string>;
  /** 「직접 입력해서 걸기」 — 내 키워드 화면(입력칸)으로. */
  onRegister: () => void;
}) {
  const queryClient = useQueryClient();
  const {data} = useQuery(HomeQueries.recommendedKeywords());
  const chips = (data ?? [])
    .filter(keyword => !registered.has(normalizeKeyword(keyword)))
    .slice(0, MAX_CHIPS);
  const {mutate, isPending} = useMutation({
    mutationFn: (keyword: string) =>
      MyPageService.addKeyword({keyword, fromRecommendation: true}),
    onSuccess: (_data, keyword) => {
      trackKeywordRegister('keyword_tab', keyword);
      showToast.success(`'${keyword}' 키워드 알림을 등록했어요.`);
      requestPushPermissionIfNeeded();
      return invalidateMyKeywords(queryClient);
    },
    // 서버가 '이미 등록된 키워드'·'최대 20개 초과' 같은 이유를 준다.
    onError: (error: unknown) =>
      showToast.error(
        (error instanceof Error && error.message) ||
          '키워드를 저장하지 못했어요.',
      ),
  });

  return (
    <View>
      {chips.length > 0 ? (
        <>
          <Text className={text.caption}>
            {KEYWORD_BOARD_COPY.recommendedTitle}
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {chips.map(keyword => (
              <PressableScale
                key={keyword}
                disabled={isPending}
                onPress={() => mutate(keyword)}
                accessibilityRole="button"
                accessibilityLabel={`${keyword} 키워드 알림 등록`}
                className={cn('flex-row items-center gap-1.5', addChip.box)}>
                <Text className={addChip.text}>{keyword}</Text>
                <Text className={addChip.plus}>+</Text>
              </PressableScale>
            ))}
          </View>
        </>
      ) : null}
      <Pressable
        onPress={onRegister}
        hitSlop={8}
        accessibilityRole="link"
        style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
        <Text className={cn('mt-3 underline', text.caption)}>
          {KEYWORD_BOARD_COPY.addMore}
        </Text>
      </Pressable>
    </View>
  );
}
