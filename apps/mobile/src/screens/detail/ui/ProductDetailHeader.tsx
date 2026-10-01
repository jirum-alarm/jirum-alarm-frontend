import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import SearchIcon from '@/shared/components/icons/search';
import ShareIcon from '@/shared/components/icons/share';
import IconLogo from '@/shared/components/icons/IconLogo';
import CaretLeftIcon from '@/shared/components/icons/caret_left';
import {useChromeColors} from '@/navigations/tab/native-headers';

/** 로고 아래 붙는 서비스 한 줄 설명. web LOGO_SUBTITLE 과 같은 문구. */
const LOGO_SUBTITLE = '커뮤니티 핫딜 모아보기';

const MIN_TAP = 36;

const pressedOpacity = ({pressed}: {pressed: boolean}) => ({
  opacity: pressed ? 0.6 : 1,
});

/**
 * 시스템 헤더 왼쪽 — 뒤로가기 옆에 붙는다. 로고를 누르면 탭 홈으로.
 *
 * 상세로 유입된 사람의 90%가 이 한 장만 보고 이탈해서, 로고만으로는
 * "여기가 뭐 하는 곳인지" 전달되지 않는다. 그래서 부제를 붙인다
 * (web 주석의 근거 그대로).
 */
export function DetailHeaderTitle({onPress}: {onPress: () => void}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="지름알림 홈으로"
      // ★함수형 style 은 opacity 객체만 돌려준다. 레이아웃까지 배열로 돌려줬더니
      // (NativeWind 가 끼어드는 Pressable) row 가 사라져 로고 아래로 글자가 떨어졌다.
      style={pressedOpacity}>
      <View style={styles.title}>
        <IconLogo size={28} />
        <View style={styles.titleText}>
          <Text
            style={styles.brand}
            className="text-gray-900"
            numberOfLines={1}>
            지름알림
          </Text>
          <Text
            style={styles.subtitle}
            className="text-gray-500"
            numberOfLines={1}>
            {LOGO_SUBTITLE}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * 시스템 헤더 왼쪽 뒤로가기.
 *
 * ★시스템 back(HeaderBackButton)은 선이 굵어 옆의 검색·공유(stroke 1.5)와
 * 눈에 띄게 어긋난다. 같은 규격 아이콘으로 맞춘다.
 */
export function DetailHeaderBackButton({onPress}: {onPress: () => void}) {
  const {headerTint} = useChromeColors();
  return (
    <HeaderIconButton onPress={onPress} label="뒤로">
      <CaretLeftIcon width={22} height={22} color={headerTint} />
    </HeaderIconButton>
  );
}

/**
 * 헤더 아이콘 버튼 한 규격 — 36pt 탭 영역 + hitSlop, 누르면 0.6(StackHeader 와 같은 규칙).
 * 아이콘은 22px · useChromeColors().headerTint 로 넣는다.
 */
export function HeaderIconButton({
  onPress,
  label,
  children,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={pressedOpacity}>
      <View style={styles.iconBtn}>{children}</View>
    </Pressable>
  );
}

/** 시스템 헤더 오른쪽 — 검색 · 공유. */
export function DetailHeaderActions({
  onPressSearch,
  onPressShare,
}: {
  onPressSearch: () => void;
  /** 목록 화면처럼 공유할 대상이 없으면 생략한다. */
  onPressShare?: () => void;
}) {
  const {headerTint} = useChromeColors();
  return (
    <View style={styles.actions}>
      <HeaderIconButton onPress={onPressSearch} label="검색">
        <SearchIcon width={22} height={22} color={headerTint} />
      </HeaderIconButton>
      {onPressShare ? (
        <HeaderIconButton onPress={onPressShare} label="공유하기">
          <ShareIcon width={22} height={22} color={headerTint} />
        </HeaderIconButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // ★뒤로가기 버튼과 같은 headerLeft 안에 들어간다. 220 이면 우측 액션
    // (검색·공유 72px)까지 더해 폭이 모자라 **뒤로가기가 밀려나 안 보인다.**
    // 로고+부제는 줄여도 읽히므로 여기서 양보한다.
    maxWidth: 150,
    flexShrink: 1,
  },
  titleText: {
    minWidth: 0,
    flexShrink: 1,
  },
  brand: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    minWidth: MIN_TAP,
    minHeight: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
