import {infiniteQueryOptions, queryOptions} from '@tanstack/react-query';

import {MyPageService, MyWishlistService} from '@/shared/api/mypage';
import {OrderOptionType, WishlistOrderType} from '@/shared/api/gql/graphql';

/** 찜 목록 한 페이지 크기. web /like 와 같은 18. */
export const WISHLIST_PAGE_SIZE = 18;

/** 키워드 상한. web KeywordList 가 `n/20` 으로 보여주는 값과 같아야 한다. */
export const MAX_KEYWORD_COUNT = 20;

/**
 * 내정보 조회. web `entities/auth/api/auth.queries.ts` + `entities/wishlist`.
 *
 * ★web 은 대부분 `useSuspenseQuery` 로 읽고 서버에서 prefetch/dehydrate 한다.
 * RN 엔 서버가 없으므로 전부 클라이언트 `useQuery` 다 — 대신 **web 에 없던
 * 로딩·에러 상태를 화면이 직접 그려야 한다**(런북 참조).
 */
export class MyPageQueries {
  static readonly keys = {
    all: ['mypage'] as const,
    me: () => [...MyPageQueries.keys.all, 'me'] as const,
    keywords: () => [...MyPageQueries.keys.all, 'keywords'] as const,
    wishlist: () => [...MyPageQueries.keys.all, 'wishlist'] as const,
    wishlistCount: () => [...MyPageQueries.keys.all, 'wishlist-count'] as const,
  };

  static me() {
    return queryOptions({
      queryKey: MyPageQueries.keys.me(),
      queryFn: MyPageService.getMyProfile,
    });
  }

  static keywords() {
    return queryOptions({
      queryKey: MyPageQueries.keys.keywords(),
      queryFn: () => MyPageService.getMyKeywords(MAX_KEYWORD_COUNT),
    });
  }

  /**
   * 찜 목록. 커서(`searchAfter`) 페이지네이션 — web 과 같은 규칙이다.
   * ★`staleTime: 0` 은 web 을 따른다. 다른 화면에서 찜을 풀고 돌아왔을 때
   * 없는 상품이 남아 있으면 눌러도 아무 일이 없다.
   */
  static infiniteWishlists() {
    return infiniteQueryOptions({
      queryKey: MyPageQueries.keys.wishlist(),
      staleTime: 0,
      queryFn: ({pageParam}) =>
        MyWishlistService.getWishlists({
          orderBy: WishlistOrderType.Id,
          orderOption: OrderOptionType.Desc,
          limit: WISHLIST_PAGE_SIZE,
          searchAfter: pageParam,
        }),
      initialPageParam: null as string[] | null,
      getNextPageParam: last => {
        const cursor = last.at(-1)?.searchAfter;
        // 마지막 페이지면 커서가 없다. 있어도 페이지가 덜 찼으면 더 없다.
        if (!cursor || last.length < WISHLIST_PAGE_SIZE) return undefined;
        return cursor;
      },
    });
  }

  static wishlistCount() {
    return queryOptions({
      queryKey: MyPageQueries.keys.wishlistCount(),
      staleTime: 0,
      queryFn: MyWishlistService.getWishlistCount,
    });
  }
}
