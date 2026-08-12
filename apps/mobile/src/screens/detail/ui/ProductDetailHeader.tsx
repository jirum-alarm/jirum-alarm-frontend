import React, {useState} from 'react';
import {Text, View} from 'react-native';

import CaretLeft from '@/shared/components/icons/caret_left';
import ShareIcon from '@/shared/components/icons/share';
import IconLogo from '@/shared/components/icons/IconLogo';
import {SERVICE_URL} from '@/constants/env';
import PressableScale from '@/shared/components/PressableScale';

import ShareSheet from './ShareSheet';

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
}: {
  productId: number;
  title?: string | null;
  onBack: () => void;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const url = `${SERVICE_URL}/products/${productId}`;

  return (
    <View
      className="w-full flex-row items-center justify-between gap-2 bg-white px-5"
      style={{height: HEADER_HEIGHT}}>
      <View className="min-w-0 flex-1 flex-row items-center">
        <PressableScale
          onPress={onBack}
          hitSlop={8}
          style={{minWidth: MIN_TAP, minHeight: MIN_TAP}}
          className="-ml-2 justify-center"
          accessibilityRole="button"
          accessibilityLabel="뒤로">
          <View className="h-11 justify-center">
            <CaretLeft width={24} height={24} />
          </View>
        </PressableScale>

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
        <PressableScale
          onPress={() => setShareOpen(true)}
          hitSlop={8}
          style={{minWidth: MIN_TAP, minHeight: MIN_TAP}}
          accessibilityRole="button"
          accessibilityLabel="공유하기">
          <View className="h-11 items-center justify-center">
            <ShareIcon width={24} height={24} />
          </View>
        </PressableScale>
      </View>
      <ShareSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${title ?? ''} | 지름알림`.trim()}
        url={url}
      />
    </View>
  );
}
