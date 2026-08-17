import React from 'react';
import {Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import TalkLight from '@/shared/components/icons/TalkLight';
import {openInAppBrowser} from '@/shared/lib/navigation';

import {OKACHAT_LINK, markOkachatJoined} from '../lib/okachat';

/**
 * 구매 직후 오카방 입장 권유. web PostPurchaseKakaoPrompt 와 같은 자리·어투.
 */
export default function PostPurchaseKakaoPrompt({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  if (!show) return null;

  return (
    <View className="flex-row items-center gap-x-3 border-b border-gray-100 bg-secondary-50 px-5 py-3">
      <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAE300]">
        <TalkLight width={18} height={18} style={{marginTop: 2}} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-gray-800">
          이런 핫딜, 카톡으로 받아볼까요?
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          로그인 없이 핫딜 Only 방에 입장해요
        </Text>
      </View>
      <PressableScale
        onPress={async () => {
          await markOkachatJoined();
          openInAppBrowser(OKACHAT_LINK);
          onClose();
        }}
        accessibilityRole="button"
        accessibilityLabel="핫딜 카톡방 입장"
        className="px-1 py-3">
        <Text className="text-xs font-bold text-secondary-600">입장</Text>
      </PressableScale>
      <PressableScale
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="카톡방 안내 닫기"
        className="px-1 py-3">
        <Text className="text-xs text-gray-500">닫기</Text>
      </PressableScale>
    </View>
  );
}
