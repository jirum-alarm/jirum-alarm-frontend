import React from 'react';
import {Text, View} from 'react-native';

/**
 * 카드의 "판매처 · 제보 커뮤니티 · 시간" 메타 한 줄.
 *
 * mallName(판매처)과 provider.nameKr(제보 커뮤니티)은 의미가 다르고 실측상 전 표본이
 * 불일치한다(롯데온 vs 에펨코리아). `mallName || provider` 로 폴백하면 "판매처" 자리에
 * 커뮤니티 이름이 들어가므로 각각 독립 슬롯으로 둔다.
 */
export default function DisplayProductSource({
  mallName,
  providerName,
  time,
}: {
  mallName?: string | null;
  providerName?: string | null;
  time?: string;
}) {
  const mall = mallName?.trim();
  const rawCommunity = providerName?.trim();
  // 몰이 직접 제보하는 상품은 판매처와 제보처가 같은 이름이라 그대로 두면
  // "알토란마켓 · 알토란마켓"으로 두 번 찍힌다.
  const community = rawCommunity === mall ? undefined : rawCommunity;

  if (!mall && !community && !time) return null;

  const dot = <Text className="text-xs text-gray-300"> · </Text>;

  return (
    <View className="flex-row items-center pt-1">
      <Text className="shrink text-xs text-gray-500" numberOfLines={1}>
        {mall ? (
          <Text className="font-medium text-gray-600">{mall}</Text>
        ) : null}
        {mall && community ? dot : null}
        {community ? <Text>{community}</Text> : null}
        {time && (mall || community) ? dot : null}
        {time ? <Text>{time}</Text> : null}
      </Text>
    </View>
  );
}
