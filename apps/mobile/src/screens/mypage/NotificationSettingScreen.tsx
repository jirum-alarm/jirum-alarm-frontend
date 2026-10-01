import React from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/navigations/tab/types';
import type {PushSettingKey} from '@/shared/api/mypage';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
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
    description: '등록한 키워드가 들어간 딜이 올라오면 알려드려요',
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
 * ponytail: 스위치는 키워드 화면의 PriceDropSwitch 를 라벨 없이 쓴다(같은 모양·햅틱).
 */
export default function NotificationSettingScreen({navigation}: Props) {
  const {data, isPending, isError, refetch} = useQuery(
    MyPageQueries.pushSetting(),
  );
  const {mutate} = useUpdatePushSetting();

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="알림 설정" onBack={navigation.goBack} />
      <ScrollView className="flex-1 bg-white">
        <View className="px-5 pt-2 pb-8">
          {isError ? (
            <SectionErrorRow label="알림 설정" onRetry={refetch} />
          ) : isPending || !data ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#667085" />
            </View>
          ) : (
            ROWS.map(({key, title, description}) => (
              <View
                key={key}
                accessible={false}
                className="flex-row items-center gap-4 border-b border-gray-200 py-4">
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-medium text-gray-900">
                    {title}
                  </Text>
                  <Text className="mt-0.5 text-xs text-gray-500">
                    {description}
                  </Text>
                </View>
                <PriceDropSwitch
                  value={data[key]}
                  onChange={next => mutate({[key]: next})}
                  showLabel={false}
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
