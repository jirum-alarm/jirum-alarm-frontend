import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Shimmer,
  ProductGridSkeleton,
  ListItemSkeleton,
} from './ShimmerPlaceholder';
import {tabNavigations} from '@/shared/constant/navigations';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

export function TabSkeleton({tabName}: {tabName: TabName}) {
  switch (tabName) {
    case tabNavigations.HOME:
      return <HomeTabSkeleton />;
    case tabNavigations.DISCOVER:
      return <DiscoverTabSkeleton />;
    case tabNavigations.COMMUNITY:
      return <CommunityTabSkeleton />;
    case tabNavigations.ALARM:
      return <AlarmTabSkeleton />;
    case tabNavigations.MYPAGE:
      return <MyPageTabSkeleton />;
    default:
      return <HomeTabSkeleton />;
  }
}

function HomeTabSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Shimmer width={100} height={24} borderRadius={4} />
        <Shimmer width={28} height={28} borderRadius={14} />
      </View>
      {/* 배너 */}
      <View style={styles.section}>
        <Shimmer
          width="100%"
          height={160}
          borderRadius={12}
          style={{marginHorizontal: 16}}
        />
      </View>
      {/* 상품 그리드 */}
      <View style={styles.section}>
        <ProductGridSkeleton />
      </View>
    </View>
  );
}

function DiscoverTabSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Shimmer width={80} height={24} borderRadius={4} />
      </View>
      {/* 탭 바 */}
      <View style={styles.tabBar}>
        <Shimmer width={60} height={32} borderRadius={16} />
        <Shimmer width={60} height={32} borderRadius={16} />
      </View>
      {/* 랭킹 리스트 */}
      <ListItemSkeleton count={8} />
    </View>
  );
}

function CommunityTabSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Shimmer width={80} height={24} borderRadius={4} />
      </View>
      <ListItemSkeleton count={8} />
    </View>
  );
}

function AlarmTabSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Shimmer width={60} height={24} borderRadius={4} />
      </View>
      <ListItemSkeleton count={10} />
    </View>
  );
}

function MyPageTabSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Shimmer width={60} height={24} borderRadius={4} />
      </View>
      {/* 프로필 카드 */}
      <View style={[styles.profileCard, {marginHorizontal: 16}]}>
        <Shimmer width={56} height={56} borderRadius={28} />
        <View style={{gap: 8, flex: 1}}>
          <Shimmer width={100} height={18} borderRadius={4} />
          <Shimmer width={150} height={14} borderRadius={4} />
        </View>
      </View>
      {/* 메뉴 리스트 */}
      <View style={styles.menuList}>
        {Array.from({length: 5}).map((_, i) => (
          <View key={i} style={styles.menuItem}>
            <Shimmer width="60%" height={16} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  section: {
    marginBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 24,
  },
  menuList: {
    paddingHorizontal: 16,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
});
