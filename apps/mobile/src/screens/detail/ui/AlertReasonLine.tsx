import {
  describeAlertReason,
  parseAlertReason,
} from '@jirum/domain/alert-reason';
import {StackActions, useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {View} from 'react-native';

import {ThemeQueries} from '@/entities/theme';
import PressableOpacity from '@/shared/components/PressableOpacity';
import {Text} from '@/shared/components/ui/Text/AppText';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {Analytics} from '@/shared/lib/analytics/ga4';

/**
 * 알림을 눌러 들어온 상세 맨 위 한 줄 — «왜 이 딜이 왔나» + 그 알림을 고치는 화면.
 * 규칙·문구는 @jirum/domain/alert-reason 한 곳(web AlertReasonLine 과 같다). 알림이 아니면 아무것도 그리지 않는다.
 */
export default function AlertReasonLine({path}: {path: string}) {
  const navigation = useNavigation();
  const reason = parseAlertReason(path);
  const {data: themes} = useQuery({
    ...ThemeQueries.themes(),
    enabled: reason?.kind === 'theme',
  });
  if (!reason) return null;
  const copy = describeAlertReason(reason, themes ?? []);
  if (!copy) return null;

  const open = () => {
    Analytics.track('alert_reason_click', {kind: reason.kind, platform: 'app'});
    // 상세 스택 타입엔 이 화면들이 없다 — 액션으로 보내 루트(탭) 스택이 받게 한다.
    navigation.dispatch(
      reason.kind === 'keyword'
        ? StackActions.push(tabStackNavigations.MYPAGE_KEYWORD, {
            focus: reason.keyword,
          })
        : reason.kind === 'theme'
        ? StackActions.push(tabStackNavigations.THEME_DETAIL, {
            themeId: reason.themeId,
          })
        : StackActions.push(tabStackNavigations.MYPAGE_NOTIFICATION),
    );
  };

  return (
    <View className="mx-5 mb-3 flex-row items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
      <Text className="flex-1 text-xs text-gray-600" numberOfLines={2}>
        {`🔔 ${copy.text}`}
      </Text>
      <PressableOpacity accessibilityRole="link" hitSlop={8} onPress={open}>
        <Text className="text-xs font-medium text-gray-700">{`${copy.action} ›`}</Text>
      </PressableOpacity>
    </View>
  );
}
