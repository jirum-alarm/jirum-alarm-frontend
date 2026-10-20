import {COMMUNITY_TABS} from '@jirum/domain/community';
import React from 'react';
import {View} from 'react-native';

import TabPill from '@/shared/components/ui/TabPill';
import type {CommunityTab} from '@/entities/community';
import {gaps} from './community-styles';

/** web `features/community/ui/TabBar` 와 같은 라벨·순서. */
/** 탭 순서·라벨 — 정본 @jirum/domain/community(web 탭 줄과 같은 표). */
export {COMMUNITY_TABS};

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
