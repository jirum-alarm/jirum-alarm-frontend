import React from 'react';
import {View} from 'react-native';

import TabPill from '@/shared/components/ui/TabPill';
import type {CommunityTab} from '@/entities/community';
import {gaps} from './community-styles';

/** web `features/community/ui/TabBar` 와 같은 라벨·순서. */
export const COMMUNITY_TABS: {label: string; value: CommunityTab}[] = [
  {label: '전체', value: 'all'},
  {label: '인기', value: 'trending'},
  {label: '공지', value: 'notice'},
];

/** 전체·인기·공지 탭 — 공용 TabPill(neutral, web TabBar 와 같은 레시피). */
export default function CommunityTabBar({
  activeTab,
  onChange,
}: {
  activeTab: CommunityTab;
  onChange: (tab: CommunityTab) => void;
}) {
  return (
    <View className="flex-row items-center px-5 py-3" style={gaps.g8}>
      {COMMUNITY_TABS.map(item => (
        <TabPill
          key={item.value}
          label={item.label}
          selected={activeTab === item.value}
          onPress={() => onChange(item.value)}
        />
      ))}
    </View>
  );
}
