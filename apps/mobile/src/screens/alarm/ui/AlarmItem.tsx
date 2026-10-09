import {prefetchProductDetail} from '@/entities/product/prefetch-detail';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import XSmall from '@/shared/components/icons/XSmall';
import SwipeToDelete from '@/shared/components/SwipeToDelete';
import {cn} from '@/shared/lib/styling';
import {firstKeyword, splitByKeyword} from '../lib/highlight';
import {parseSourceKey, sourceLabel} from '../lib/notification-source';
import {displayTime} from '@/shared/lib/format/price';
import type {NotificationItem} from '@/shared/api/notification';

import Thumbnail from '@/shared/components/product/Thumbnail';

import AlarmItemNoImage from './AlarmItemNoImage';
import {useColors} from '@/shared/theme/useColors';
import Badge from '@/shared/components/ui/Badge';

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
 *
 * ★memo — 읽음·삭제 하나에 목록 전체가 다시 그려지지 않게 한다.
 */
const AlarmItem = React.memo(function AlarmItem({
  notification,
  isNew,
  isEditMode,
  onPress,
  onDelete,
  sourceKey,
  onPressSource,
}: {
  notification: NotificationItem;
  isNew: boolean;
  isEditMode: boolean;
  /** 어디서 온 알림인가(`notificationSourceKey`). 있으면 줄 위에 라벨로 — 누르면 그 알림의 설정으로. */
  sourceKey?: string;
  onPressSource?: (sourceKey: string) => void;
  // ★알림 자체를 함께 넘겨 부모가 콜백 하나(useCallback)를 그대로 줄 수 있게 —
  // 행마다 화살표 함수를 만들면 memo 가 무력해진다.
  onPress: (notification: NotificationItem, productId: number | null) => void;
  onDelete: (id: number) => void;
}) {
  const c = useColors();
  const {id, message, createdAt, product, keyword, readAt, title} =
    notification;
  const productId = product?.id != null ? Number(product.id) : null;
  const {thumbnail, price, isHot, isEnd} = product ?? {};

  const highlightKeyword = firstKeyword(keyword);
  const label = sourceKey ? sourceLabel(parseSourceKey(sourceKey)) : undefined;
  const sourceAction = label ? `${label} 설정` : undefined;

  return (
    // 편집모드는 줄마다 X 가 있으니 밀기를 끈다(같은 줄에 삭제가 두 갈래면 헷갈린다).
    <SwipeToDelete
      enabled={!isEditMode}
      onDelete={() => onDelete(Number(id))}
      accessibilityLabel={`${message} 알림 삭제`}>
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
          android_ripple={{color: c.gray[100]}}
          // 편집모드에서는 상세로 가지 않는다(web 이 preventDefault 하는 자리).
          onPress={() => {
            if (isEditMode) return;
            onPress(notification, productId);
          }}
          // 손가락이 닿는 순간 상세를 받기 시작한다(상품 카드와 같다).
          onPressIn={() => {
            if (!isEditMode && productId != null) {
              prefetchProductDetail(productId, thumbnail);
            }
          }}
          accessibilityRole="button"
          // 행이 자식을 한 덩어리로 읽어서 VoiceOver·TalkBack 은 안쪽 키워드 라벨을 따로 못 고른다 —
          // 같은 이동을 행의 사용자 지정 동작으로 연다(로터·위아래 쓸기 → "OO 키워드 알림 설정").
          // ★name 이 곧 읽히는 말이다 — iOS(Fabric)는 label 이 아니라 name 으로 UIAccessibilityCustomAction 을 만든다.
          accessibilityActions={
            sourceAction
              ? [{name: sourceAction, label: sourceAction}]
              : undefined
          }
          onAccessibilityAction={e => {
            if (
              sourceKey &&
              e.nativeEvent.actionName === sourceAction &&
              !isEditMode
            ) {
              onPressSource?.(sourceKey);
            }
          }}>
          <View className="h-14 w-14 overflow-hidden rounded-sm border border-gray-200">
            <Thumbnail uri={thumbnail} fallback={<AlarmItemNoImage />} />
          </View>
          <View className="flex-1 pl-3">
            {/* 어디서 온 알림인지 — 누르면 그 알림의 설정으로 간다(엉뚱한 키워드 알림 → 제외 단어,
              관심사 → 구독 해제, 좋은 딜 → 알림 설정).
              행 전체(상세 이동) 안에 둔 Pressable 이라 여기를 누르면 이쪽만 반응한다. */}
            {sourceKey && label ? (
              <Pressable
                onPress={() => {
                  if (!isEditMode) onPressSource?.(sourceKey);
                }}
                // 글자(12pt)만큼이라 첫 탭이 빗나가 상세로 갔다(10/7 시뮬레이터). 위·오른쪽은 행 여백이라
                // 넉넉히 넓히고, 아래는 본문(상세 이동)과 겹치지 않게 0. py-1 + -mt-1 로 줄 간격은 그대로.
                hitSlop={{top: 12, bottom: 0, left: 8, right: 24}}
                accessibilityRole="button"
                accessibilityLabel={label}
                className="-mt-1 self-start py-1"
                style={({pressed}) => (pressed ? {opacity: 0.6} : null)}>
                <Text className="text-xs text-gray-500" numberOfLines={1}>
                  {`${label} ›`}
                </Text>
              </Pressable>
            ) : null}
            {/* 상품 없는 알림(댓글 답글·좋아요)은 본문만으론 무슨 알림인지 모른다 — 제목을 같이. */}
            {productId == null && title ? (
              <Text
                className="text-sm font-semibold text-gray-900"
                numberOfLines={1}>
                {title}
              </Text>
            ) : null}
            <HighlightedMessage message={message} keyword={highlightKeyword} />
            <View className="flex-row items-center gap-x-3 pt-2">
              {isEnd ? (
                <Badge size="tag" variant="outline" tone="gray">
                  판매종료
                </Badge>
              ) : isHot ? (
                <Badge size="tag" variant="solid" tone="error">
                  핫딜
                </Badge>
              ) : null}
              {price ? (
                <>
                  <Text
                    className="shrink font-semibold text-gray-900"
                    numberOfLines={1}>
                    {price}
                  </Text>
                  <View className="h-2.5 border-l border-gray-400" />
                </>
              ) : null}
              <Text className="text-xs text-gray-500">
                {displayTime(createdAt)}
              </Text>
            </View>
          </View>
        </Pressable>
        {isEditMode ? (
          <Pressable
            accessibilityRole="button"
            // 목록에 X 가 줄마다 있어 "알림 삭제" 만으론 어느 줄인지 구분이 안 된다.
            accessibilityLabel={`${message} 알림 삭제`}
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
    </SwipeToDelete>
  );
});

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

export default AlarmItem;
