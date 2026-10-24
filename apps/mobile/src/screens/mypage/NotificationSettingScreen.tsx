import React from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {KeywordAlertLevel} from '@/shared/api/gql/graphql';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {useAuth} from '@/entities/auth/useAuth';
import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';
import type {PushSettingKey} from '@/shared/api/mypage';
import PressableScale from '@/shared/components/PressableScale';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {usePushPermissionStatus} from '@/shared/lib/fcm/usePushPermissionStatus';
import {tabStackNavigations} from '@/shared/constant/navigations';
import Switch from '@/shared/components/ui/Switch';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {useUpdatePushSetting} from '@/features/mypage/model/mutations';
import QuietHoursRow from '@/features/mypage/ui/QuietHoursRow';
import {text} from '@jirum/design-system/recipes';
import {cn} from '@/shared/lib/styling/className';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.MYPAGE_NOTIFICATION
>;

const ROWS: {key: PushSettingKey; title: string; description: string}[] = [
  {
    key: 'keywordAlert',
    title: '키워드 알림',
    description: '등록한 키워드나 구독한 관심사의 딜이 올라오면 알려드려요',
  },
  {
    // 푸시 통로가 없어 알림함에만 쌓이는 키워드 알림을 하루 한 통으로(crawling send_email_digest). 토큰이 있으면 안 보낸다.
    // 게스트는 이메일이 없어 숨긴다. web PushSettingForm 과 같은 문구.
    key: 'emailDigest',
    title: '키워드 알림 이메일로 받기',
    description:
      '앱·웹 알림을 받지 않는 동안, 새 딜을 하루 한 번 가입 이메일로 모아 보내드려요',
  },
  {
    // 광고성 정보(정보통신망법 §50) — 서버는 이 동의(marketing)한 유저에게만 "(광고)" 를 붙여 낮에만 보낸다.
    key: 'marketing',
    title: '지금 뜨는 좋은 딜 (광고성 정보 수신 동의)',
    description:
      '관심 카테고리에서 반응이 뜨거운 딜을 낮 시간에 하루 최대 3번 알려드려요',
  },
  {
    key: 'communityAlert',
    title: '커뮤니티 알림',
    description: '내 글·댓글에 달린 댓글과 좋아요',
  },
  {
    key: 'nightAlerts',
    title: '야간 광고성 알림 수신 동의 (21~08시)',
    // 2026-10-24~ 서버는 광고성(좋은 딜)만 야간 동의를 본다. 직접 건 키워드·관심사·커뮤니티 알림은 밤에도 바로 간다.
    description:
      '「지금 뜨는 좋은 딜」 같은 광고성 알림만 해당해요. 키워드·커뮤니티 알림은 밤에도 바로 오니, 쉬고 싶으면 방해금지 시간을 정하세요',
  },
];

/**
 * 키워드 알림 받는 기준(서버 keywordAlertLevel). 끄면 딜이 올라오자마자, 켜면 인기글이 되거나 근거로 대박딜이 됐을 때
 * 「콜라 핫딜 떴어요 🔥」로 받는다. web PushSettingForm 과 같은 문구.
 */
const HOT_ONLY = {
  title: '핫딜이 되면만 받기',
  description:
    '딜이 올라오자마자가 아니라, 반응이 뜨거워지거나 확실히 싸다고 확인됐을 때만 알려드려요',
};

/**
 * 알림 설정. web `/mypage/notification`(PushSettingForm).
 *
 * 백엔드(pushSetting / updatePushSetting)는 있었는데 화면이 없어서 2026-10-01 기준 사용자
 * 전원이 기본값이었다(야간 동의 0 → 밤 알림이 전부 아침으로 밀림).
 */
export default function NotificationSettingScreen({navigation}: Props) {
  const {data, isPending, isError, refetch} = useQuery(
    MyPageQueries.pushSetting(),
  );
  const {mutate} = useUpdatePushSetting();
  const {isGuest} = useAuth();
  const rows = isGuest ? ROWS.filter(row => row.key !== 'emailDigest') : ROWS;
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
            hitSlop={6}
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
            <>
              {rows.map(({key, title, description}) => (
                <React.Fragment key={key}>
                  <View
                    accessible={false}
                    className="flex-row items-center gap-4 border-b border-gray-200 py-4">
                    <View className="min-w-0 flex-1">
                      <Text className="font-medium text-gray-900">{title}</Text>
                      <Text className={cn(text.muted, 'mt-0.5')}>
                        {description}
                      </Text>
                    </View>
                    <Switch
                      value={data[key]}
                      onChange={next => mutate({[key]: next})}
                      accessibilityLabel={title}
                    />
                  </View>
                  {key === 'keywordAlert' && data.keywordAlert ? (
                    <View
                      accessible={false}
                      className="flex-row items-center gap-4 border-b border-gray-200 py-4 pl-4">
                      <View className="min-w-0 flex-1">
                        <Text className="font-medium text-gray-900">
                          {HOT_ONLY.title}
                        </Text>
                        <Text className={cn(text.muted, 'mt-0.5')}>
                          {HOT_ONLY.description}
                        </Text>
                      </View>
                      <Switch
                        value={data.keywordAlertLevel === KeywordAlertLevel.Hot}
                        onChange={next =>
                          mutate({
                            keywordAlertLevel: next
                              ? KeywordAlertLevel.Hot
                              : KeywordAlertLevel.All,
                          })
                        }
                        accessibilityLabel={HOT_ONLY.title}
                      />
                    </View>
                  ) : null}
                </React.Fragment>
              ))}
              <QuietHoursRow
                start={data.quietHoursStart}
                end={data.quietHoursEnd}
                onChange={mutate}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
