import React from 'react';
import {Pressable, Text, View} from 'react-native';

import {cn} from '@/shared/lib/styling';
import type {CommunityTab} from '@/entities/community';
import {gaps} from './community-styles';

/** web `features/community/ui/TabBar` 와 같은 라벨·순서. */
export const COMMUNITY_TABS: {label: string; value: CommunityTab}[] = [
  {label: '전체', value: 'all'},
  {label: '인기', value: 'trending'},
  {label: '공지', value: 'notice'},
];

/**
 * 전체·인기·공지 칩. web 은 `active:scale-95` 를 주지만 칩은 작아서
 * 눌림 배경만으로 충분하고, PressableScale 을 쓰면 폭 계산이 얽힌다.
 */
export default function CommunityTabBar({
  activeTab,
  onChange,
}: {
  activeTab: CommunityTab;
  onChange: (tab: CommunityTab) => void;
}) {
  return (
    <View className="flex-row items-center px-5 py-3" style={gaps.g8}>
      {COMMUNITY_TABS.map(tab => {
        const isActive = activeTab === tab.value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            accessibilityRole="button"
            accessibilityState={{selected: isActive}}
            accessibilityLabel={tab.label}
            style={({pressed}) => (pressed ? {opacity: 0.7} : null)}
            className={cn(
              'h-8 justify-center rounded-full px-3',
              isActive ? 'bg-gray-900' : 'bg-gray-100',
            )}>
            <Text
              className={cn(
                'text-sm font-medium',
                isActive ? 'text-white' : 'text-gray-600',
              )}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
