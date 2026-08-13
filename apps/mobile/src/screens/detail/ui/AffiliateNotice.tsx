import React from 'react';
import {Text, View} from 'react-native';

/** web lib/isCoupangPartner.ts 와 동일 규칙. */
export function isCoupangPartner(mallName?: string | null): boolean {
  if (!mallName) return false;
  return mallName.includes('쿠팡') || mallName.includes('coupang');
}

/**
 * 제휴 수익 고지.
 *
 * ★ 장식이 아니라 제휴 표시 의무 대응이다. 웹은 모든 상품에 둘 중 하나를
 * 상호배타로 띄운다 — 쿠팡 계열이면 쿠팡 파트너스 문구, 그 외는 일반 제휴 문구.
 * 네이티브 전환 때 둘 다 빠져 있었다(디자인 리뷰 2026-08-12).
 *
 * 문구는 web 과 한 글자도 다르면 안 된다. 고지 문구는 법무 검토 대상이라
 * 임의로 다듬지 말 것.
 */
export default function AffiliateNotice({
  mallName,
  variant,
}: {
  mallName?: string | null;
  /** coupang = 상단(상품정보 직후) / general = 하단(콘텐츠 끝) */
  variant: 'coupang' | 'general';
}) {
  const isCoupang = isCoupangPartner(mallName);

  // 쿠팡이면 쿠팡 문구만, 아니면 일반 문구만. 둘이 같이 뜨면 안 된다.
  if (variant === 'coupang' && !isCoupang) return null;
  if (variant === 'general' && isCoupang) return null;

  if (variant === 'coupang') {
    return (
      <View className="flex-row items-center gap-3 bg-gray-100 px-3.5 py-3.5">
        <Text className="text-xs font-medium text-gray-700">안내</Text>
        <Text className="flex-1 text-xs text-gray-600">
          쿠팡 파트너스 활동으로 지름알림이 일정 금액의 수수료를 지급 받습니다.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-6 bg-gray-100 px-5 py-5">
      <Text className="mb-1 text-sm font-semibold text-gray-700">안내</Text>
      <Text className="text-sm text-gray-600">
        일부 링크는 제휴 마케팅이 적용되어 지름알림에 커미션이 지급될 수
        있습니다.
      </Text>
    </View>
  );
}
