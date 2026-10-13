import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import PressableScale from '@/shared/components/PressableScale';
import TalkLight from '@/shared/components/icons/TalkLight';

import {useBeautyRoomAssignment} from '../lib/beauty-room-experiment';
import {
  OKACHAT_BEAUTY_LINK,
  OKACHAT_LINK,
  hasJoinedOkachat,
  openOkachat,
  trackOkachatEvent,
  type OkachatRoom,
} from '../lib/okachat';

import BeautyVerticalLink from './BeautyVerticalLink';

/**
 * 상세페이지용 핫딜 카톡방 입장 안내.
 * 이미 입장한 유저(AsyncStorage)에게는 숨긴다.
 *
 * 화장품 상세는 실험 beauty_detail_room_v1(web SoftKakaoOpenChatPrompt 와 같은 분기): b 군은 같은 자리에서
 * 뷰티방을 권하고(뷰티방 입장 기록이 있으면 숨김) 아래에 「지름알림 뷰티에서 더 보기」를 단다.
 */
export default function KakaoOpenChatPrompt({
  categoryId,
  productId,
}: {
  categoryId?: number | null;
  productId?: number;
}) {
  const assignment = useBeautyRoomAssignment(categoryId);
  const beauty = assignment?.arm === 'b';
  const room: OkachatRoom = beauty ? 'beauty' : 'hotdeal';
  const link = beauty ? OKACHAT_BEAUTY_LINK : OKACHAT_LINK;
  const exp = assignment?.exp;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 화장품 상세는 군이 정해질 때까지 기다린다 — 핫딜방을 띄웠다가 뷰티방으로 바꾸지 않게.
    if (assignment === undefined) return;
    let cancelled = false;
    hasJoinedOkachat(room).then(joined => {
      if (!cancelled) setVisible(!joined);
    });
    return () => {
      cancelled = true;
    };
  }, [assignment, room]);

  // web SoftKakaoOpenChatPrompt: 노출 조건을 통과해 보이게 된 순간 한 번.
  useEffect(() => {
    if (!visible) return;
    trackOkachatEvent('okachat_prompt_view', 'soft', {room, exp});
  }, [visible, room, exp]);

  const card = visible ? (
    <PressableScale
      onPress={async () => {
        trackOkachatEvent('okachat_prompt_click', 'soft', {room, exp});
        setVisible(false);
        await openOkachat(link, room);
      }}
      // ponytail: web 과 같은 문법 — 면은 그대로, 테두리+채운 알약으로만 눈에 띄게.
      className={
        beauty
          ? 'flex-row items-center gap-x-3 rounded-lg border border-secondary-200 bg-secondary-50 px-4 py-3'
          : 'mx-5 mb-4 flex-row items-center gap-x-3 rounded-lg border border-secondary-200 bg-secondary-50 px-4 py-3'
      }
      accessibilityRole="button"
      accessibilityLabel={
        beauty ? '뷰티 핫딜 카톡방 입장' : '핫딜 오픈 채팅방 입장'
      }>
      <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kakao">
        <TalkLight width={18} height={18} style={{marginTop: 2}} />
      </View>
      <View className="min-w-0 flex-1">
        {/* "핫딜 Only"는 UTM 캠페인명·봇 설정값이 새어 나온 내부 용어. web 과 같이 간다. */}
        <Text className="text-sm font-semibold text-gray-800">
          {beauty ? '뷰티 핫딜만 받는 카톡방' : '핫딜 오픈 채팅방 입장하기'}
        </Text>
        {/* 좁은 폰(360dp)에선 한 줄에 안 들어가 말줄임됐다 — 두 줄까지 허용. */}
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={2}>
          {beauty
            ? '화장품·스킨케어 핫딜만 모아 보내드려요'
            : '지름알림이 엄선한 핫딜만 골라 받아보세요!'}
        </Text>
      </View>
      <View className="shrink-0 rounded-full border border-secondary-300 bg-white px-3 py-1.5">
        <Text className="text-xs font-semibold text-secondary-600">입장</Text>
      </View>
    </PressableScale>
  ) : null;

  if (beauty && assignment) {
    return (
      <View className="mx-5 mb-4">
        {card}
        <BeautyVerticalLink
          exp={assignment.exp}
          productId={productId}
          className={visible ? 'mt-2' : undefined}
        />
      </View>
    );
  }

  return card;
}
