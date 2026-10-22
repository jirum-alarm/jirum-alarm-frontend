import React from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {text} from '@jirum/design-system/recipes';
import {cn} from '@/shared/lib/styling/className';

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
  postedCommunityCount,
  time,
  spacing = 'top',
}: {
  mallName?: string | null;
  providerName?: string | null;
  /** 랭킹이 같은 딜을 한 칸으로 접으며 센 커뮤니티 수. 2 이상이면 「뽐뿌 외 N곳」. */
  postedCommunityCount?: number | null;
  time?: string;
  /**
   * 위 여백. web 은 호출부가 className 으로 정한다 —
   * Grid/Carousel 은 pt-1, List/DoubleRow 는 부모 gap 에 맡기고 0.
   * 여기에 하드코딩하면 gap 을 쓰는 카드에서 4px 씩 덧나온다.
   */
  spacing?: 'top' | 'none';
}) {
  const mall = mallName?.trim();
  const rawCommunity = providerName?.trim();
  // 몰이 직접 제보하는 상품은 판매처와 제보처가 같은 이름이라 그대로 두면
  // "알토란마켓 · 알토란마켓"으로 두 번 찍힌다.
  const community = rawCommunity === mall ? undefined : rawCommunity;
  // 여러 커뮤니티가 동시에 올렸다는 것도 좋은 딜의 근거다(web DisplayProductSource 와 같은 표기).
  const otherCommunities =
    community && postedCommunityCount ? postedCommunityCount - 1 : 0;

  if (!mall && !community && !time) return null;

  // eslint-disable-next-line no-restricted-syntax -- 구분점(글자 아님)
  const dot = <Text className="text-xs text-gray-300"> · </Text>;

  return (
    <View
      className={
        spacing === 'top'
          ? 'flex-row items-center pt-1'
          : 'flex-row items-center'
      }>
      <Text className={cn(text.caption, 'shrink')} numberOfLines={1}>
        {mall ? (
          <Text className="font-medium text-gray-600">{mall}</Text>
        ) : null}
        {mall && community ? dot : null}
        {community ? <Text>{community}</Text> : null}
        {otherCommunities > 0 ? (
          <Text className="font-medium text-gray-600">
            {` 외 ${otherCommunities}곳`}
          </Text>
        ) : null}
        {time && (mall || community) ? dot : null}
        {time ? <Text>{time}</Text> : null}
      </Text>
    </View>
  );
}
