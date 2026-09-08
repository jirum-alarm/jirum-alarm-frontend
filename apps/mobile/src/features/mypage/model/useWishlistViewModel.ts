import {useMemo} from 'react';
import {useInfiniteQuery, useMutation, useQuery} from '@tanstack/react-query';

import {MyPageQueries, WISHLIST_PAGE_SIZE} from '@/entities/mypage';
import {MyWishlistService} from '@/shared/api/mypage';
import type {ProductCardType} from '@/entities/home/model/types';

/**
 * 찜 목록. web `/like` 의 `ProductLikeContainer` + `ProductLikeGridList`.
 *
 * ★web 은 하트를 눌러도 **목록에서 지우지 않는다** — 카드 안의 로컬 state 로
 * 하트만 비우고, 목록·개수는 다음 진입에 반영된다. 앱도 그대로 둔다.
 * (지우면 잘못 눌렀을 때 되돌릴 카드가 사라져 되레 나쁘다. web 과 다른 동작을
 * 앱에만 넣으면 같은 데이터가 두 화면에서 달라 보인다.)
 */
export function useWishlistViewModel() {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(MyPageQueries.infiniteWishlists());

  const {data: count, refetch: refetchCount} = useQuery(
    MyPageQueries.wishlistCount(),
  );

  /**
   * 카드가 그릴 형태로 변환. `?? []` 를 그대로 쓰면 매 렌더 새 배열이라
   * 아래 콜백·리스트가 계속 재생성된다 → useMemo (런북 참조).
   */
  const products = useMemo<ProductCardType[]>(
    () =>
      (data?.pages ?? []).flat().map(row => ({
        id: row.product.id,
        title: row.product.title,
        price: row.product.price,
        thumbnail: row.product.thumbnail,
        postedAt: row.product.postedAt,
        categoryId: row.product.categoryId,
        isEnd: row.product.isEnd,
        isHot: row.product.isHot,
        hotDealType: row.product.hotDealType,
        mallName: row.product.mallName,
        provider: row.product.provider,
      })),
    [data?.pages],
  );

  const {mutate: addWishlist} = useMutation({
    mutationFn: MyWishlistService.addWishlist,
  });
  const {mutate: removeWishlist} = useMutation({
    mutationFn: MyWishlistService.removeWishlist,
  });

  return {
    products,
    count: count ?? 0,
    isPending,
    isError,
    refetch: async () => {
      await Promise.all([refetch(), refetchCount()]);
    },
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    isFetchingNextPage,
    pageSize: WISHLIST_PAGE_SIZE,
    setWishlist: (productId: number, liked: boolean) => {
      if (liked) addWishlist({productId});
      else removeWishlist({productId});
    },
  };
}
