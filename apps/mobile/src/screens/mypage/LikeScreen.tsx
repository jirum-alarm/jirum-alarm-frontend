import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import CurationGrid from '@/entities/home/ui/CurationGrid';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import type {TabStackParamList} from '@/navigations/tab/types';
import Heart from '@/shared/components/icons/Heart';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {useWishlistViewModel} from '@/features/mypage/model/useWishlistViewModel';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.LIKE
>;

/**
 * 찜 목록. web `/like`(ProductLikeContainer + ProductLikeGridList).
 *
 * ★그리드는 새로 만들지 않았다 — `CurationGrid`(2열 · 로딩 · 에러 · 빈 상태 ·
 * pull-to-refresh · 무한스크롤)와 `GridCard` 를 그대로 쓴다. web 도 같은
 * `ProductGridCard` 를 쓰므로 카드 모양이 홈·더보기와 저절로 일치한다.
 *
 * ★web 의 `useInView` 센티넬은 `onEndReached` 로 대체한다(RN 엔
 * IntersectionObserver 가 없다).
 */
export default function LikeScreen({navigation}: Props) {
  const bottomClip = useHiddenTabBarClipPadding();
  const {
    products,
    count,
    isPending,
    isError,
    refetch,
    loadMore,
    isFetchingNextPage,
    setWishlist,
  } = useWishlistViewModel();

  const stackNavigation =
    useNavigation<NativeStackNavigationProp<TabStackParamList>>();
  const openDetail = useCallback(
    (id: number) => {
      stackNavigation.push(tabStackNavigations.DETAIL, {
        path: `/products/${id}`,
      });
    },
    [stackNavigation],
  );

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="찜 목록" onBack={navigation.goBack} />
      {/* 전체 개수 — web `전체 N개`. 목록이 비어도 web 은 이 줄을 그린다. */}
      {!isPending && !isError ? (
        <View className="px-5 pt-3 pb-3">
          <Text className="text-sm text-gray-900">
            {'전체 '}
            <Text className="font-semibold">{count}</Text>
            {'개'}
          </Text>
        </View>
      ) : null}
      <CurationGrid
        items={products}
        keyOf={item => String(item.id)}
        renderCard={item => (
          <View>
            <GridCard product={item} onPress={openDetail} />
            {/* web 은 썸네일 우상단에 하트를 얹는다(ProductGridCard actionIcon). */}
            <View className="absolute top-0 right-0">
              <WishlistHeart
                productId={Number(item.id)}
                onChange={setWishlist}
              />
            </View>
          </View>
        )}
        isPending={isPending}
        isError={isError}
        label="찜 목록"
        onRetry={refetch}
        onEndReached={loadMore}
        bottomInset={bottomClip}
        footer={
          isFetchingNextPage ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color="#667085" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

/**
 * 찜 해제/재등록 하트. web `ProductLikeAction`.
 *
 * ★web 과 같이 **목록에서 카드를 지우지 않는다** — 로컬 state 로 하트만 비운다.
 * 잘못 눌렀을 때 되돌릴 카드가 남아야 하고, 지워버리면 같은 데이터가 다음
 * 진입과 달라 보인다(useWishlistViewModel 주석 참조).
 */
function WishlistHeart({
  productId,
  onChange,
}: {
  productId: number;
  onChange: (productId: number, liked: boolean) => void;
}) {
  const [liked, setLiked] = useState(true);

  return (
    <Pressable
      onPress={() => {
        const next = !liked;
        setLiked(next);
        onChange(productId, next);
      }}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityState={{selected: liked}}
      accessibilityLabel={liked ? '찜 해제' : '찜하기'}
      className="p-3"
      style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
      <Heart liked={liked} />
    </Pressable>
  );
}
