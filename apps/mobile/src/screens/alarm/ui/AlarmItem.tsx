import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import XSmall from '@/shared/components/icons/XSmall';
import {cn} from '@/shared/lib/styling';
import {firstKeyword, splitByKeyword} from '../lib/highlight';
import {displayTime} from '@/shared/lib/format/price';
import type {NotificationItem} from '@/shared/api/notification';

import AlarmItemNoImage from './AlarmItemNoImage';

/** 키워드와 일치하는 부분만 굵게. 분할 규칙은 `lib/highlight` 가 정본이다. */
function HighlightedMessage({
  message,
  keyword,
}: {
  message: string;
  keyword: string;
}) {
  const parts = splitByKeyword(message, keyword);

  return (
    <Text className="text-sm text-gray-900" numberOfLines={2}>
      {parts.map((part, i) =>
        part.match ? (
          <Text key={i} className="font-bold">
            {part.text}
          </Text>
        ) : (
          <Text key={i}>{part.text}</Text>
        ),
      )}
    </Text>
  );
}

/**
 * 알림 한 줄. web `features/alarm/ui/AlarmItem` 과 같은 레이아웃·문구.
 *
 * web 의 li + Link 구조를 Pressable 하나로 접었다 — 상품이 없으면
 * (서버가 product=null 을 주는 삭제/비공개 건) 상세로 보내지 않고 읽음만 찍는다.
 */
export default function AlarmItem({
  notification,
  isNew,
  isEditMode,
  onPress,
  onDelete,
}: {
  notification: NotificationItem;
  isNew: boolean;
  isEditMode: boolean;
  onPress: (productId: number | null) => void;
  onDelete: (id: number) => void;
}) {
  const {id, message, createdAt, product, keyword, readAt} = notification;
  const productId = product?.id != null ? Number(product.id) : null;
  const {thumbnail, price, isHot, isEnd} = product ?? {};

  const highlightKeyword = firstKeyword(keyword);

  return (
    <View
      className={cn(
        'relative',
        isNew && !readAt ? 'bg-primary-50' : 'bg-white',
        // web: 읽은 알림은 opacity-60
        readAt && 'opacity-60',
      )}>
      <Pressable
        // ★행은 화면 폭을 꽉 채우므로 카드처럼 scale 을 주면 어색하다
        // (PressableScale 은 카드용). 대신 눌린 동안 옅은 배경을 깐다 —
        // 목록 행의 관행이고, 배경 강조(bg-primary-50)와도 겹치지 않는다.
        style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
        className="w-full flex-row p-5 pr-14"
        android_ripple={{color: '#F2F4F7'}}
        // 편집모드에서는 상세로 가지 않는다(web 이 preventDefault 하는 자리).
        onPress={() => {
          if (isEditMode) return;
          onPress(productId);
        }}>
        <View className="h-14 w-14 overflow-hidden rounded-sm border border-gray-200">
          {thumbnail ? (
            <Image
              source={{uri: thumbnail}}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <AlarmItemNoImage />
          )}
        </View>
        <View className="flex-1 pl-3">
          <HighlightedMessage message={message} keyword={highlightKeyword} />
          <View className="flex-row items-center gap-x-3 pt-2">
            {isEnd ? (
              <View className="h-[22px] justify-center rounded-lg border border-gray-400 bg-white px-2">
                <Text className="text-xs font-semibold text-gray-500">
                  판매종료
                </Text>
              </View>
            ) : isHot ? (
              <View className="bg-error-500 h-[22px] justify-center rounded-lg px-3">
                <Text className="text-xs font-semibold text-white">핫딜</Text>
              </View>
            ) : null}
            {price ? (
              <>
                <Text
                  className="max-w-56 font-semibold text-gray-900"
                  numberOfLines={1}>
                  {price}
                </Text>
                <View className="h-2.5 border-l border-gray-400" />
              </>
            ) : null}
            <Text className="text-xs text-gray-400">
              {displayTime(createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>
      {isEditMode ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="알림 삭제"
          hitSlop={12}
          // ★PressableScale 을 쓰면 안 된다 — className 을 **안쪽 View** 에
          // 넘기는 구조라 `absolute` 가 껍데기가 아니라 내부에 걸린다.
          // 실측: h=0 · w=402 로 잡혀 행 아래에 끼어 보였다.
          style={styles.deleteButton}
          onPress={() => onDelete(Number(id))}>
          <XSmall />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  /** 편집모드 삭제(X). 행 높이를 꽉 채우고 그 안에서 세로 가운데. */
  deleteButton: {
    position: 'absolute',
    right: 20, // web right-5
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
