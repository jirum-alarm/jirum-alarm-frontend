import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackHeaderProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Text} from '@/shared/components/ui/Text/AppText';
import {HEADER_HEIGHT} from '@/features/mypage/ui/StackHeader';
import {DetailHeaderBackButton} from '@/screens/detail/ui/ProductDetailHeader';
import {useChromeColors} from '@/navigations/tab/native-headers';

/**
 * 탭 스택의 헤더 — 시스템 헤더 대신 JS 로 그린다(2026-10-01).
 *
 * iOS 26 시스템 헤더는 리퀴드 글라스라 바탕이 회색으로 비치고 버튼마다 유리 캡슐이
 * 씌워진다(사용자 지적 "왜 배경이 회색이야"). react-native-screens 4.16 엔 그걸 끄는
 * 옵션이 없고, 올리면 네이티브가 바뀌어 스토어 빌드가 필요하다. 탭바와 같은 이유로 JS.
 * 모양은 내정보 하위 화면의 StackHeader 와 같다(흰 바탕·56·아래 gray-100 선·왼쪽 제목).
 *
 * 화면은 지금처럼 `headerLeft`·`headerRight`·`title` 을 setOptions 로 채우면 된다.
 * `headerTitle` 을 함수로 주면(상세) 제목 자리를 비운다.
 */
export default function AppStackHeader({
  navigation,
  options,
  back,
}: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const chrome = useChromeColors();
  const canGoBack = !!back;
  const left = options.headerLeft ? (
    options.headerLeft({canGoBack, tintColor: chrome.headerTint})
  ) : canGoBack ? (
    <DetailHeaderBackButton onPress={() => navigation.goBack()} />
  ) : null;
  const right = options.headerRight?.({
    canGoBack,
    tintColor: chrome.headerTint,
  });
  const title =
    typeof options.headerTitle === 'function'
      ? null
      : options.headerTitle ?? options.title;

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top,
          backgroundColor: chrome.headerBackground,
          borderBottomColor: chrome.headerBorder,
        },
      ]}>
      <View style={styles.bar}>
        <View style={styles.left}>
          {left}
          {title ? (
            <Text
              style={[styles.title, {color: chrome.headerTint}]}
              numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 선은 gray-100 — StackHeader 와 같은 선
  wrap: {borderBottomWidth: 1},
  bar: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {flexDirection: 'row', alignItems: 'center'},
  title: {
    flexShrink: 1,
    paddingLeft: 8,
    fontSize: 18,
    fontWeight: '600',
  },
});
