import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import IconLogo from '@/shared/components/icons/IconLogo';
import SearchIcon from '@/shared/components/icons/search';
import {tabStackNavigations} from '@/shared/constant/navigations';
import type {TabStackParamList} from '@/navigations/tab/types';

/** 로고 아래 붙는 서비스 한 줄 설명. web LOGO_SUBTITLE 과 같은 문구. */
const LOGO_SUBTITLE = '커뮤니티 핫딜 모아보기';

/** web `transition-all duration-300` 과 같은 전환 시간. */
const TRANSITION_MS = 300;

/**
 * 홈 헤더. 스크롤 90px 을 넘으면 다크 → 흰색으로 **색만** 부드럽게 바뀐다.
 *
 * ★web 은 흰 헤더를 위에서 slide-in 시키지만(`-translate-y-full`),
 * 네이티브에선 그게 어색했다(사용자 지적) — 헤더는 제자리에 두고 색만
 * 크로스페이드한다. 단순 배경색 토글도 어색하다(한 프레임에 뚝 바뀜).
 *
 * 두 겹을 겹쳐 놓고 위 겹(흰색)의 opacity 만 움직인다. 배경·글자·아이콘이
 * 한꺼번에 같은 곡선으로 넘어가서, 배경색만 보간할 때 생기는
 * "배경은 흰데 글씨는 아직 흰색" 어긋남이 없다.
 *
 * ★ 로고 크기는 상세 헤더(28)와 맞춘다 — IconLogo 는 viewBox 32 중 잉크가 21.6뿐이라
 * size 를 그대로 믿으면 실제보다 작게 보인다(logo-size-prop-lies-viewbox-slack).
 */
export default function HomeHeader({
  isScrolled,
  onPressLogo,
}: {
  isScrolled: boolean;
  /** 로고 탭 — 맨 위로. web 은 `/` 링크라 홈에선 같은 체감이다. */
  onPressLogo?: () => void;
}) {
  const insets = useSafeAreaInsets();
  // 0 = 다크(맨 위), 1 = 흰 헤더
  const progress = useRef(new Animated.Value(isScrolled ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isScrolled ? 1 : 0,
      duration: TRANSITION_MS,
      // opacity 만 쓰므로 네이티브 드라이버로 돌린다(스크롤 중에도 60fps).
      useNativeDriver: true,
    }).start();
  }, [isScrolled, progress]);

  return (
    <View style={{height: insets.top + 56}}>
      {/* 아래 겹: 다크. 배너와 같은 gray-900 이라 이어져 보인다. */}
      <View
        className="absolute inset-0 bg-gray-900"
        style={{paddingTop: insets.top}}>
        <HeaderRow inverted onPressLogo={onPressLogo} />
      </View>

      {/* 위 겹: 흰 헤더. 제자리에서 opacity 만 올라온다(슬라이드 없음). */}
      <Animated.View
        className="absolute inset-0 bg-white"
        style={{paddingTop: insets.top, opacity: progress}}>
        <HeaderRow inverted={false} onPressLogo={onPressLogo} />
      </Animated.View>
    </View>
  );
}

/** 로고·부제·검색 한 줄. 두 겹이 같은 내용을 각자의 색으로 그린다. */
function HeaderRow({
  inverted,
  onPressLogo,
}: {
  inverted: boolean;
  onPressLogo?: () => void;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<TabStackParamList>>();

  return (
    <View className="h-14 w-full flex-row items-center justify-between px-5">
      {/* 로고 탭 = 맨 위로. hitSlop 으로 터치 영역을 넓힌다. */}
      <Pressable
        onPress={onPressLogo}
        disabled={!onPressLogo}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="지름알림 홈, 맨 위로"
        className="max-w-[220px] flex-row items-center gap-2">
        <IconLogo size={28} />
        <View className="min-w-0 shrink">
          <Text
            className={
              inverted
                ? 'text-base font-semibold text-white'
                : 'text-base font-semibold text-gray-800'
            }
            numberOfLines={1}>
            지름알림
          </Text>
          <Text
            className={
              inverted
                ? 'text-[11px] text-white/70'
                : 'text-[11px] text-gray-500'
            }
            numberOfLines={1}>
            {LOGO_SUBTITLE}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => navigation.push(tabStackNavigations.SEARCH)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="검색"
        // 흰 겹이 위에 깔려 있어도 투명할 때는 아래 겹이 눌려야 한다.
        // 두 겹의 버튼이 같은 자리라 어느 쪽이 눌려도 동작은 같다.
        className="h-9 w-9 items-center justify-center">
        <SearchIcon
          width={24}
          height={24}
          color={inverted ? '#FFFFFF' : '#101828'}
        />
      </Pressable>
    </View>
  );
}
