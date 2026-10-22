import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {Text} from '@/shared/components/ui/Text/AppText';

import PressableScale from '@/shared/components/PressableScale';
import TalkLight from '@/shared/components/icons/TalkLight';

import type {BeautyRoomAssignment} from '../lib/beauty-room-experiment';
import {
  OKACHAT_BEAUTY_LINK,
  OKACHAT_LINK,
  openOkachat,
  trackOkachatEvent,
} from '../lib/okachat';
import {text} from '@jirum/design-system/recipes';
import {cn} from '@/shared/lib/styling/className';

/**
 * 구매 직후 오카방 입장 권유. web PostPurchaseKakaoPrompt 와 같은 자리·어투.
 * 화장품 상세 실험(beauty_detail_room_v1) b 군은 뷰티방을 권한다 — 큐는 BottomCTA 가 뷰티방 입장 기록으로 짠다.
 */
export default function PostPurchaseKakaoPrompt({
  show,
  onClose,
  beautyRoom,
}: {
  show: boolean;
  onClose: () => void;
  /** useBeautyRoomAssignment 결과 — 화장품 상세가 아니면 null/undefined(핫딜방, exp 없음). */
  beautyRoom?: BeautyRoomAssignment | null;
}) {
  const beauty = beautyRoom?.arm === 'b';
  const room = beauty ? 'beauty' : 'hotdeal';
  const exp = beautyRoom?.exp;

  // web PostPurchaseKakaoPrompt: show 가 켜질 때마다(구매 클릭 후 큐 차례). 단 구매 웹뷰가 위에 떠 있는 동안은
  // 아무도 못 보니 상세로 돌아와 화면이 앞에 왔을 때 센다 — 예전엔 클릭 순간 세어 노출이 부풀었다(2026-10-17).
  // 한 번 뜬 권유는 한 번만 센다 — 상세에서 다른 화면을 다녀와도 다시 세지 않게.
  const focused = useIsFocused();
  const counted = useRef(false);
  useEffect(() => {
    if (!show) {
      counted.current = false;
      return;
    }
    if (!focused || counted.current) return;
    counted.current = true;
    trackOkachatEvent('okachat_prompt_view', 'after_purchase', {room, exp});
  }, [show, focused, room, exp]);

  if (!show) return null;

  return (
    <View className="flex-row items-center gap-x-3 border-b border-gray-100 bg-secondary-50 px-5 py-3">
      <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kakao">
        <TalkLight width={18} height={18} style={{marginTop: 2}} />
      </View>
      <View className="min-w-0 flex-1">
        {/* 문구는 web PostPurchaseKakaoPrompt 와 같이 간다 — 같은 방을 가리키는 카드다. */}
        <Text className="text-sm font-semibold text-gray-800">
          {beauty
            ? '카톡으로 뷰티 핫딜 먼저 받아보세요'
            : '카톡으로 핫딜 먼저 받아보세요'}
        </Text>
        <Text className={cn(text.caption, 'mt-0.5')} numberOfLines={1}>
          {beauty
            ? '화장품·스킨케어 핫딜만 모아 보내드려요'
            : '지름알림이 엄선한 핫딜만 골라 보내드려요'}
        </Text>
      </View>
      <PressableScale
        onPress={async () => {
          trackOkachatEvent('okachat_prompt_click', 'after_purchase', {
            room,
            exp,
          });
          onClose();
          await openOkachat(beauty ? OKACHAT_BEAUTY_LINK : OKACHAT_LINK, room);
        }}
        accessibilityRole="button"
        accessibilityLabel={
          beauty ? '뷰티 핫딜 카톡방 입장' : '핫딜 카톡방 입장'
        }
        className="px-1 py-3">
        <Text className="text-xs font-bold text-secondary-600">입장</Text>
      </PressableScale>
      <PressableScale
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="카톡방 안내 닫기"
        className="px-1 py-3">
        <Text className={text.caption}>닫기</Text>
      </PressableScale>
    </View>
  );
}
