import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CaretLeft from '@/shared/components/icons/caret_left';
import Close from '@/shared/components/icons/Close';

/** web PageHeader 와 같은 높이(h-14)·경계선. 알림 탭 헤더와도 같은 값이다. */
export const HEADER_HEIGHT = 56;

/**
 * 내정보 하위 화면들의 상단 바. web `BasicLayout hasBackButton title=...` 대응.
 *
 * ★네이티브 헤더(`baseHeaderOptions`)를 쓰지 않고 화면이 직접 그린다.
 *   - 약관 화면은 web 과 같이 **오른쪽 X**로 닫는다(모달 흐름) — 시스템 헤더로는
 *     좌측 백버튼과 섞여 두 개가 된다.
 *   - 화면이 헤더를 쥐면 네비게이터 등록에 옵션이 필요 없다(스택 기본
 *     `headerShown: false` 그대로). 알림 탭이 쓰는 방식과 같다.
 */
export default function StackHeader({
  title,
  onBack,
  variant = 'back',
}: {
  title: string;
  onBack: () => void;
  /** 'back' = 왼쪽 화살표(기본), 'close' = 오른쪽 X(약관·정책). */
  variant?: 'back' | 'close';
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-b border-gray-100 bg-white px-5"
      style={{paddingTop: insets.top}}>
      <View className="flex-row items-center" style={{height: HEADER_HEIGHT}}>
        {variant === 'back' ? (
          <>
            {/*
              행·아이콘 버튼은 PressableScale 을 쓰지 않는다 — 헤더 버튼이
              줄어들면 제목까지 흔들려 보인다(런북: 행과 버튼은 다르다).
            */}
            <Pressable
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="뒤로"
              style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
              <CaretLeft />
            </Pressable>
            <Text
              className="pl-5 text-lg font-semibold text-gray-900"
              numberOfLines={1}
              style={styles.title}>
              {title}
            </Text>
          </>
        ) : (
          <>
            <Text
              className="text-lg font-semibold text-gray-900"
              numberOfLines={1}
              style={styles.title}>
              {title}
            </Text>
            <Pressable
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
              <Close />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /** 제목이 남은 폭을 다 먹어야 아이콘이 양 끝에 붙는다. */
  title: {flex: 1},
});
