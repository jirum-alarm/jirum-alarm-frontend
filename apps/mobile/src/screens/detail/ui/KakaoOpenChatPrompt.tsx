import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import TalkLight from '@/shared/components/icons/TalkLight';
import {openInAppBrowser} from '@/shared/lib/navigation';

import {
  OKACHAT_LINK,
  hasJoinedOkachat,
  markOkachatJoined,
} from '../lib/okachat';

/**
 * 상세페이지용 핫딜 카톡방 입장 안내.
 * 이미 입장한 유저(AsyncStorage)에게는 숨긴다.
 */
export default function KakaoOpenChatPrompt({href}: {href?: string}) {
  const [visible, setVisible] = useState(false);
  const link = href ?? OKACHAT_LINK;

  useEffect(() => {
    let cancelled = false;
    hasJoinedOkachat().then(joined => {
      if (!cancelled) setVisible(!joined);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <PressableScale
      onPress={async () => {
        await markOkachatJoined();
        setVisible(false);
        openInAppBrowser(link);
      }}
      // ponytail: web 과 같은 문법 — 면은 그대로, 테두리+채운 알약으로만 눈에 띄게.
      className="mx-5 mb-4 flex-row items-center gap-x-3 rounded-lg border border-secondary-200 bg-secondary-50 px-4 py-3"
      accessibilityRole="button"
      accessibilityLabel="핫딜 오픈 채팅방 입장">
      <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAE300]">
        <TalkLight width={18} height={18} style={{marginTop: 2}} />
      </View>
      <View className="min-w-0 flex-1">
        {/* "핫딜 Only"는 UTM 캠페인명·봇 설정값이 새어 나온 내부 용어. web 과 같이 간다. */}
        <Text className="text-sm font-semibold text-gray-800">
          핫딜 오픈 채팅방 입장하기
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          지름알림이 엄선한 핫딜만 골라 받아보세요!
        </Text>
      </View>
      <View className="shrink-0 rounded-full border border-secondary-300 bg-white px-3 py-1.5">
        <Text className="text-xs font-semibold text-secondary-600">입장</Text>
      </View>
    </PressableScale>
  );
}
