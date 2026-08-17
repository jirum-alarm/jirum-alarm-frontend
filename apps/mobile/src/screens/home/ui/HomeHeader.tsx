import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import IconLogo from '@/shared/components/icons/IconLogo';
import SearchIcon from '@/shared/components/icons/search';
import {tabStackNavigations} from '@/shared/constant/navigations';
import type {TabStackParamList} from '@/navigations/tab/types';
import {cn} from '@/shared/lib/styling';

/** 로고 아래 붙는 서비스 한 줄 설명. web LOGO_SUBTITLE 과 같은 문구. */
const LOGO_SUBTITLE = '커뮤니티 핫딜 모아보기';

/**
 * 홈 헤더. web: mobile/HomeHeader(스크롤 후 흰 헤더) + BackgroundHeader(다크 위 반전).
 *
 * web 은 두 컴포넌트로 나눠 하나는 fixed·translate 로 내려오게 하지만,
 * RN 은 stickyHeaderIndices 로 항상 붙여두고 색만 바꾸는 편이 단순하다.
 * 스크롤 90px 기준은 web 과 동일(useScrollPosition(90)).
 *
 * ★ 로고 크기는 상세 헤더(28)와 맞춘다 — IconLogo 는 viewBox 32 중 잉크가 21.6뿐이라
 * size 를 그대로 믿으면 실제보다 작게 보인다(logo-size-prop-lies-viewbox-slack).
 */
export default function HomeHeader({isScrolled}: {isScrolled: boolean}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<TabStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(isScrolled ? 'bg-white' : 'bg-gray-900')}
      style={{paddingTop: insets.top}}>
      <View className="h-14 w-full flex-row items-center justify-between px-5">
        <View className="max-w-[220px] flex-row items-center gap-2">
          <IconLogo size={28} />
          <View className="min-w-0 shrink">
            <Text
              className={cn(
                'text-base font-semibold',
                isScrolled ? 'text-gray-800' : 'text-white',
              )}
              numberOfLines={1}>
              지름알림
            </Text>
            <Text
              className={cn(
                'text-[11px]',
                isScrolled ? 'text-gray-500' : 'text-white/70',
              )}
              numberOfLines={1}>
              {LOGO_SUBTITLE}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.push(tabStackNavigations.SEARCH)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="검색"
          className="h-9 w-9 items-center justify-center">
          <SearchIcon
            width={24}
            height={24}
            color={isScrolled ? '#101828' : '#FFFFFF'}
          />
        </Pressable>
      </View>
    </View>
  );
}
