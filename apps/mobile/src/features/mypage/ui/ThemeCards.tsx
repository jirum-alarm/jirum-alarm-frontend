import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import type {ThemeWithKeywords} from '@/shared/api/theme';
import {tick} from '@/shared/lib/feedback';

/**
 * 알림 묶음 카드 2종. web `ThemeList`(목록) · `MySubscribedThemes`(키워드 화면).
 *
 * ★구독 버튼은 카드 안에 있고 카드 자체도 눌러 상세로 간다 —
 * web 은 `e.preventDefault()` 로 링크를 막았고, RN 은 자식 `Pressable` 이
 * 터치를 먹으므로 따로 막을 게 없다.
 */

/** 묶음 목록 카드. */
export function ThemeCard({
  theme,
  isSubscribed,
  isPending,
  onPress,
  onToggleSubscribe,
}: {
  theme: ThemeWithKeywords;
  isSubscribed: boolean;
  isPending: boolean;
  onPress: () => void;
  onToggleSubscribe: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={theme.name}
      style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}
      className="rounded-2xl border border-gray-200 p-4">
      <View className="flex-row items-start justify-between">
        <View className="min-w-0" style={styles.grow}>
          <View className="flex-row items-center gap-1.5">
            {theme.emoji ? <Text>{theme.emoji}</Text> : null}
            <Text className="text-base font-semibold text-gray-900">
              {theme.name}
            </Text>
          </View>
          <Text className="mt-1 text-sm text-gray-500">
            {theme.description}
          </Text>
          {/* web ThemeList 와 같은 줄 — 몇 개 단어로 찾고 얼마나 오는지. */}
          <Text className="mt-1 text-xs text-gray-500">
            {theme.keywords.length > 0
              ? `키워드 ${theme.keywords.length}개 · `
              : ''}
            최근 7일 알림{' '}
            <Text className="font-semibold text-gray-900">
              {theme.weeklyAlertCount}건
            </Text>
          </Text>
        </View>
        <Pressable
          onPress={() => {
            tick();
            onToggleSubscribe();
          }}
          disabled={isPending}
          accessibilityRole="button"
          accessibilityLabel={isSubscribed ? '알림 끄기' : '알림 받기'}
          accessibilityState={{selected: isSubscribed}}
          // web `w-16`(64px) 고정. 텍스트가 '받는 중'/'알림 받기' 로 바뀌어도
          // 카드 폭이 흔들리지 않는다.
          style={
            isPending ? styles.subscribeButtonDimmed : styles.subscribeButton
          }
          className={
            isSubscribed
              ? 'ml-3 shrink-0 items-center rounded-full bg-gray-100 py-1.5'
              : 'bg-primary-500 ml-3 shrink-0 items-center rounded-full py-1.5'
          }>
          <Text
            className={
              isSubscribed
                ? 'text-sm font-medium text-gray-500'
                : 'text-sm font-medium text-fixed-900'
            }>
            {isSubscribed ? '받는 중' : '알림 받기'}
          </Text>
        </Pressable>
      </View>
      {/* 깜깜이 구독 방지: 묶음에 어떤 키워드가 들었는지 미리보기(web 과 같다). */}
      {theme.representativeKeywords.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-1.5">
          {theme.representativeKeywords.map(keyword => (
            <Text
              key={keyword}
              className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
              {keyword}
            </Text>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * 키워드 화면의 "구독한 묶음" 행. web `MySubscribedThemes` 의 li.
 * ★해제만 있고 구독은 없다(구독은 묶음 목록에서 한다).
 */
export function SubscribedThemeRow({
  theme,
  isPending,
  onPress,
  onUnsubscribe,
}: {
  theme: ThemeWithKeywords;
  isPending: boolean;
  onPress: () => void;
  onUnsubscribe: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={theme.name}
        // ★Pressable 엔 opacity 만 — className·배열 style 을 함수형 style 과 섞으면
        // NativeWind 가 레이아웃을 떨군다(상세 헤더 로고가 세로로 쌓였던 원인).
        style={({pressed}) => ({flex: 1, opacity: pressed ? 0.6 : 1})}>
        <View className="min-w-0 gap-1">
          <View className="min-w-0 flex-row items-center gap-1.5">
            {theme.emoji ? <Text>{theme.emoji}</Text> : null}
            <Text className="text-sm text-gray-900" numberOfLines={1}>
              {theme.name}
            </Text>
          </View>
          <Text className="bg-primary-50 text-primary-800 self-start rounded px-1.5 py-0.5 text-[11px] font-medium">
            관심사
          </Text>
        </View>
      </Pressable>
      <Pressable
        onPress={onUnsubscribe}
        disabled={isPending}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${theme.name} 알림 끄기`}
        style={isPending ? styles.dimmed : undefined}
        className="shrink-0 p-2">
        {/* web 은 gray-400 인데 명암비 2.58:1 로 AA 미달이라 gray-500 을 쓴다. */}
        <Text className="text-xs text-gray-500">끄기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: {flex: 1},
  dimmed: {opacity: 0.5},
  subscribeButton: {width: 64},
  subscribeButtonDimmed: {width: 64, opacity: 0.5},
});
