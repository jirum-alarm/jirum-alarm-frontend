import React from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/navigations/tab/types';
import type {PushSettingKey} from '@/shared/api/mypage';
import PressableScale from '@/shared/components/PressableScale';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {usePushPermissionStatus} from '@/shared/lib/fcm/usePushPermissionStatus';
import {tabStackNavigations} from '@/shared/constant/navigations';
import PriceDropSwitch from '@/features/mypage/ui/PriceDropSwitch';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {useUpdatePushSetting} from '@/features/mypage/model/mutations';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.MYPAGE_NOTIFICATION
>;

const ROWS: {key: PushSettingKey; title: string; description: string}[] = [
  {
    key: 'keywordAlert',
    title: '키워드 알림',
    description:
      '등록한 키워드가 들어간 딜이 올라오면 알려드려요. 관심사 알림은 각 관심사 화면에서 끌 수 있어요',
  },
  {
    key: 'hotDealAlert',
    title: '지금 뜨는 좋은 딜',
    description:
      '관심 카테고리에서 반응이 뜨거운 딜을 하루 최대 3번 알려드려요',
  },
  {
    key: 'communityAlert',
    title: '커뮤니티 알림',
    description: '내 글·댓글에 달린 댓글과 좋아요',
  },
  {
    key: 'nightAlerts',
    title: '야간 알림 수신 동의 (21~08시)',
    description: '끄면 밤사이 알림은 아침 8시에 모아서 보내드려요',
  },
];

/**
 * 알림 설정. web `/mypage/notification`(PushSettingForm).
 *
 * 백엔드(pushSetting / updatePushSetting)는 있었는데 화면이 없어서 2026-10-01 기준 1,204명
 * 전원이 기본값이었다(야간 동의 0명 → 밤 알림이 전부 아침으로 밀림).
 * ponytail: 스위치는 PriceDropSwitch(모양·햅틱을 직접 그린 것)를 쓴다.
 */
export default function NotificationSettingScreen({navigation}: Props) {
  const {data, isPending, isError, refetch} = useQuery(
    MyPageQueries.pushSetting(),
  );
  const {mutate} = useUpdatePushSetting();
  // 휴대폰 알림 권한이 꺼져 있으면 아래 스위치가 다 켜져 있어도 아무것도 안 온다 — 그걸 먼저 알린다.
  const push = usePushPermissionStatus();

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="알림 설정" onBack={navigation.goBack} />
      {push.granted === false ? (
        <View className="flex-row items-center justify-between gap-x-3 border-b border-gray-200 bg-gray-50 px-5 py-3">
          <Text className="flex-1 text-sm font-medium text-gray-700">
            휴대폰 알림이 꺼져 있어 아래 알림이 오지 않아요
          </Text>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="알림 켜기"
            className="h-8 justify-center rounded-md bg-fixed-800 px-3"
            onPress={push.enable}>
            <Text className="text-sm font-semibold text-primary-500">켜기</Text>
          </PressableScale>
        </View>
      ) : null}
      <ScrollView className="flex-1 bg-white">
        <View className="px-5 pt-2 pb-8">
          {isError ? (
            <SectionErrorRow label="알림 설정" onRetry={refetch} />
          ) : isPending || !data ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" className="text-gray-500" />
            </View>
          ) : (
            ROWS.map(({key, title, description}) => (
              <View
                key={key}
                accessible={false}
                className="flex-row items-center gap-4 border-b border-gray-200 py-4">
                <View className="min-w-0 flex-1">
                  <Text className="font-medium text-gray-900">{title}</Text>
                  <Text className="mt-0.5 text-sm text-gray-500">
                    {description}
                  </Text>
                </View>
                <PriceDropSwitch
                  value={data[key]}
                  onChange={next => mutate({[key]: next})}
                  accessibilityLabel={title}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
