import React, {useState} from 'react';
import {View} from 'react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import Svg, {Path} from 'react-native-svg';

import {MyPageService} from '@/shared/api/mypage';
import PressableScale from '@/shared/components/PressableScale';
import {Text} from '@/shared/components/ui/Text/AppText';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {trackKeywordRegister} from '@/shared/lib/analytics/keyword-tracking';
import {requestPushPermissionIfNeeded} from '@/shared/lib/fcm/push-permission';
import {showToast} from '@/shared/lib/feedback';
import {isValidKeyword} from '@/features/mypage/lib/validation';

import {
  invalidateMyKeywords,
  normalizeKeyword,
  openKeywordSettings,
  useMyKeywordSet,
} from '../model/myKeywords';
import {useColors} from '@/shared/theme/useColors';

/**
 * 검색한 바로 그 단어로 **한 번에** 알림을 건다. 예전엔 "키워드 등록" 이 빈 키워드 화면으로
 * 보내서 방금 친 단어를 다시 쳐야 했다 — 검색은 "이걸 원한다" 는 가장 강한 신호인데 거기서 끊겼다.
 *
 * - `variant="bar"`: 검색 결과 위 한 줄. `variant="cta"`: 결과 없음 화면의 큰 버튼.
 * - 누르는 즉시 "알림 받는 중" 으로 바꾸고(낙관적), 실패하면 되돌린다.
 */
export default function KeywordAlertButton({
  keyword,
  variant,
}: {
  keyword: string;
  variant: 'bar' | 'cta';
}) {
  const c = useColors();
  const queryClient = useQueryClient();
  const registered = useMyKeywordSet();
  const [optimistic, setOptimistic] = useState<string | null>(null);
  const trimmed = keyword.trim();
  const isOn =
    registered.has(normalizeKeyword(trimmed)) || optimistic === trimmed;

  const {mutate} = useMutation({
    mutationFn: () => MyPageService.addKeyword({keyword: trimmed}),
    onSuccess: () => {
      trackKeywordRegister(
        variant === 'bar' ? 'search_bar' : 'search_no_result',
        trimmed,
      );
      // 등록한 뒤 갈 곳이 없던 자리 — 조건(제외 단어·가격)을 바로 손볼 수 있게 키워드 화면으로 잇는다.
      showToast.success(`'${trimmed}' 새 핫딜이 올라오면 알려드릴게요.`, {
        action: {label: '보기', onPress: openKeywordSettings},
      });
      requestPushPermissionIfNeeded();
      return invalidateMyKeywords(queryClient);
    },
    onError: (error: unknown) => {
      setOptimistic(null);
      const message = error instanceof Error ? error.message : '';
      // 다른 화면에서 이미 등록했다면 실패가 아니다 — 켜진 상태로 맞춘다.
      if (message.includes('이미 등록된')) {
        invalidateMyKeywords(queryClient);
        return;
      }
      showToast.error(message || '알림을 등록하지 못했어요.');
    },
  });

  // 2~20자 밖이면 키워드로 못 건다 — 버튼을 내밀었다가 거절하느니 안 보인다.
  if (!isValidKeyword(trimmed)) return null;

  const onPress = () => {
    if (isOn) return;
    Analytics.track('search_keyword_alert_click', {keyword: trimmed, variant});
    setOptimistic(trimmed);
    mutate();
  };

  const label = isOn
    ? `${trimmed} 알림 받는 중`
    : `${trimmed} 새 핫딜 알림 받기`;

  if (variant === 'cta') {
    return (
      <PressableScale
        onPress={onPress}
        disabled={isOn}
        accessibilityRole="button"
        accessibilityState={{disabled: isOn}}
        accessibilityLabel={label}
        className={
          isOn
            ? 'flex-row items-center gap-x-1.5 rounded-lg bg-gray-100 px-5 py-3'
            : 'flex-row items-center gap-x-1.5 rounded-lg bg-fixed-800 px-5 py-3'
        }>
        {isOn ? <Check color={c.primary[700]} /> : null}
        <Text
          className={
            isOn
              ? 'text-base font-semibold text-gray-700'
              : 'text-base font-semibold text-primary-500'
          }>
          {isOn ? '알림 받는 중' : `'${trimmed}' 알림 받기`}
        </Text>
      </PressableScale>
    );
  }

  return (
    <View className="mx-5 mb-3 flex-row items-center gap-x-3 rounded-xl bg-gray-50 py-2 pl-4 pr-2">
      <Text className="min-w-0 flex-1 text-sm text-gray-700" numberOfLines={1}>
        <Text className="font-semibold text-gray-900">‘{trimmed}’</Text>
        {isOn ? ' 새 핫딜을 알려드리고 있어요' : ' 새 핫딜, 놓치지 마세요'}
      </Text>
      <PressableScale
        onPress={onPress}
        disabled={isOn}
        accessibilityRole="button"
        accessibilityState={{disabled: isOn}}
        accessibilityLabel={label}
        className={
          isOn
            ? 'h-9 flex-row items-center gap-x-1 rounded-lg px-3'
            : 'h-9 flex-row items-center rounded-lg bg-fixed-800 px-3'
        }>
        {isOn ? <Check color={c.primary[700]} /> : null}
        <Text
          className={
            isOn
              ? 'text-sm font-semibold text-primary-700'
              : 'text-sm font-semibold text-primary-500'
          }>
          {isOn ? '받는 중' : '알림 받기'}
        </Text>
      </PressableScale>
    </View>
  );
}

// ✓ 글리프 대신 SVG — 글꼴에 U+2713 이 없으면 두부가 된다.
const Check = ({color}: {color: string}) => (
  <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
    <Path
      d="M4 10.5l4 4 8-8.5"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
