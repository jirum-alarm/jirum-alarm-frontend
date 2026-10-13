import React from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Text} from '@/shared/components/ui/Text/AppText';
import PressableScale from '@/shared/components/PressableScale';
import ArrowRight from '@/shared/components/icons/ArrowRight';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {cn} from '@/shared/lib/styling';
import {tabStackNavigations} from '@/shared/constant/navigations';
import type {TabStackParamList} from '@/navigations/tab/types';

/** 지름알림 뷰티 경로 — web 과 같은 주소(곧 별도 앱이 받지만 경로는 같다). */
export const BEAUTY_VERTICAL_PATH = '/beauty';

/**
 * 화장품 상세 → 지름알림 뷰티. 실험 beauty_detail_room_v1 b 군에만(KakaoOpenChatPrompt).
 * 앱이 그리지 않는 web 페이지라 홈 배너·더보기와 같은 공용 웹뷰(WEBVIEW, 경로만 넘긴다)로 연다.
 * 계측: web 과 같은 beauty_vertical_click(placement=detail, exp, product_id).
 */
export default function BeautyVerticalLink({
  exp,
  productId,
  className,
}: {
  exp: string;
  productId?: number;
  className?: string;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<TabStackParamList>>();
  return (
    <PressableScale
      onPress={() => {
        Analytics.track('beauty_vertical_click', {
          placement: 'detail',
          exp,
          product_id: productId ? String(productId) : undefined,
        });
        navigation.push(tabStackNavigations.WEBVIEW, {
          uri: BEAUTY_VERTICAL_PATH,
          title: '지름알림 뷰티',
        });
      }}
      className={cn(
        'flex-row items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3',
        className,
      )}
      accessibilityRole="link"
      accessibilityLabel="지름알림 뷰티에서 더 보기">
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-gray-800">
          지름알림 뷰티에서 더 보기
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          지금 뜨는 화장품·스킨케어 핫딜 모음
        </Text>
      </View>
      <ArrowRight width={18} height={18} />
    </PressableScale>
  );
}
