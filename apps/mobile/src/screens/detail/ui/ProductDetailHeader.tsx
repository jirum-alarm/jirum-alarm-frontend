import React from 'react';
import {Pressable, Share, Text, View} from 'react-native';

import CaretLeft from '@/shared/components/icons/caret_left';
import IconLogo from '@/shared/components/icons/IconLogo';
import {SERVICE_URL} from '@/constants/env';

/** 로고 아래 붙는 서비스 한 줄 설명. web LOGO_SUBTITLE 과 같은 문구. */
const LOGO_SUBTITLE = '커뮤니티 핫딜 모아보기';

/** web PAGE_HEADER_HEIGHT_CLASS = h-14 (56px). */
const HEADER_HEIGHT = 56;
const MIN_TAP = 44;

/**
 * 상세 공통 헤더. web ProductDetailPageHeader 와 같은 구성 —
 * 뒤로가기 · 로고+부제 · 검색 · 공유.
 *
 * 상세로 유입된 사람의 90%가 이 한 장만 보고 이탈해서, 로고만으로는
 * "여기가 뭐 하는 곳인지" 전달되지 않는다. 그래서 부제를 로고의 부제로 붙인다
 * (web 주석의 근거 그대로).
 */
export default function ProductDetailHeader({
  productId,
  title,
  onBack,
  onPressSearch,
}: {
  productId: number;
  title?: string | null;
  onBack: () => void;
  onPressSearch?: () => void;
}) {
  const handleShare = async () => {
    const url = `${SERVICE_URL}/products/${productId}`;
    try {
      // iOS 는 title/url 을 분리하면 카톡 등에서 2번 전송된다(웹뷰 브리지와 같은 이유).
      await Share.share({message: title ? `${title}\n${url}` : url});
    } catch {
      // 사용자가 공유 시트를 닫은 것도 여기로 온다. 조용히 무시.
    }
  };

  return (
    <View
      className="w-full flex-row items-center justify-between gap-2 bg-white px-5"
      style={{height: HEADER_HEIGHT}}>
      <View className="min-w-0 flex-1 flex-row items-center">
        <Pressable
          onPress={onBack}
          hitSlop={8}
          style={{minWidth: MIN_TAP, minHeight: MIN_TAP}}
          className="-ml-2 justify-center"
          accessibilityRole="button"
          accessibilityLabel="뒤로">
          <CaretLeft width={24} height={24} />
        </Pressable>

        <View className="min-w-0 flex-1 flex-row items-center gap-2 pl-1">
          <IconLogo size={32} />
          <View className="min-w-0 shrink">
            <Text
              className="text-lg font-semibold text-gray-900"
              numberOfLines={1}>
              지름알림
            </Text>
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {LOGO_SUBTITLE}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center">
        {onPressSearch ? (
          <Pressable
            onPress={onPressSearch}
            hitSlop={8}
            style={{minWidth: MIN_TAP, minHeight: MIN_TAP}}
            className="items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="검색">
            <Text className="text-lg text-gray-700">⌕</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={handleShare}
          hitSlop={8}
          style={{minWidth: MIN_TAP, minHeight: MIN_TAP}}
          className="items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="공유">
          <Text className="text-lg text-gray-700">↗</Text>
        </Pressable>
      </View>
    </View>
  );
}
