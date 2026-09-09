import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import ArrowRight from '@/shared/components/icons/ArrowRight';

/**
 * 목록 행 공통 눌림 처리.
 *
 * ★행은 화면 폭을 꽉 채워서 `PressableScale`(0.95 축소)이 어색하다 —
 * 눌림 opacity + android_ripple 로 간다(런북: 행과 버튼은 다르다).
 */
function Row({
  onPress,
  children,
  accessibilityLabel,
  className,
}: {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{color: '#F2F4F7'}}
      style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}
      className={className}>
      {children}
    </Pressable>
  );
}

/** 내정보 메뉴 행. web `MenuList` 의 li(아이콘 + 제목). */
export function MenuRow({
  icon,
  title,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}) {
  return (
    <Row onPress={onPress} accessibilityLabel={title}>
      <View className="flex-row items-center gap-3 py-3">
        <View className="h-7 w-7 items-center justify-center">{icon}</View>
        {/* ★이동하는 행은 chevron 을 준다 — 같은 화면에서 프로필 행만 있고
            메뉴 행엔 없어서 어디를 누를 수 있는지가 행마다 달라 보였다. */}
        <Text className="text-gray-900" style={styles.grow}>
          {title}
        </Text>
        <ArrowRight />
      </View>
    </Row>
  );
}

/** 가입 정보의 이동 행. web `MovePage`(제목 · 부제 · 화살표). */
export function MovePageRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle?: string | null;
  onPress: () => void;
}) {
  return (
    <Row onPress={onPress} accessibilityLabel={title}>
      <View className="flex-row items-center justify-between py-3">
        <Text className="text-sm text-gray-600">{title}</Text>
        <View className="flex-row items-center gap-2">
          {subtitle ? (
            <Text className="text-sm text-gray-900" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          <ArrowRight />
        </View>
      </View>
    </Row>
  );
}

/** 약관 및 정책의 단순 텍스트 행. web `terms-policies` 의 Link. */
export function TextRow({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Row onPress={onPress} accessibilityLabel={title}>
      {/* MenuRow 와 같은 이유로 chevron. 아이콘이 없어 제목이 왼쪽 끝이다. */}
      <View className="flex-row items-center px-5 py-4">
        <Text className="text-gray-900" style={styles.grow}>
          {title}
        </Text>
        <ArrowRight />
      </View>
    </Row>
  );
}

/**
 * 마이페이지 폼 화면의 하단 CTA 여백(safe area·clip 제외한 순수 여백).
 *
 * ★한 곳에서 정한다 — 예전엔 화면마다 리터럴(20·24·32)을 써서 같은 저장 버튼이
 * 다섯 높이에 앉았다(iOS 26 실측 하단여백 54.3 / 54.3 / 58.3 / 32.0 / 20.3pt).
 * safe area 는 `KeyboardStickyView offset={{closed: -insets.bottom}}` 가 있는
 * 화면은 그게, 없는 화면은 `insets.bottom` 을 직접 더해 맞춘다.
 */
export const FORM_CTA_BOTTOM = 20;

const styles = StyleSheet.create({
  grow: {flex: 1},
});
