import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import SearchIcon from '@/shared/components/icons/search';
import ShareIcon from '@/shared/components/icons/share';
import IconLogo from '@/shared/components/icons/IconLogo';

/** 로고 아래 붙는 서비스 한 줄 설명. web LOGO_SUBTITLE 과 같은 문구. */
const LOGO_SUBTITLE = '커뮤니티 핫딜 모아보기';

const MIN_TAP = 36;

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
      style={styles.title}>
      <IconLogo size={28} />
      <View style={styles.titleText}>
        <Text style={styles.brand} numberOfLines={1}>
          지름알림
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {LOGO_SUBTITLE}
        </Text>
      </View>
    </Pressable>
  );
}

/** 시스템 헤더 오른쪽 — 검색 · 공유. */
export function DetailHeaderActions({
  onPressSearch,
  onPressShare,
}: {
  onPressSearch: () => void;
  onPressShare: () => void;
}) {
  return (
    <View style={styles.actions}>
      <Pressable
        onPress={onPressSearch}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="검색"
        style={styles.iconBtn}>
        <SearchIcon width={22} height={22} />
      </Pressable>
      <Pressable
        onPress={onPressShare}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="공유하기"
        style={styles.iconBtn}>
        <ShareIcon width={22} height={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 220,
  },
  titleText: {
    minWidth: 0,
    flexShrink: 1,
  },
  brand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101828',
  },
  subtitle: {
    fontSize: 11,
    color: '#667085',
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
