import {
  MutationAddMyWishlist,
  MutationRemoveMyWishlist,
  QueryMyWishlistCount,
  QueryMyWishlists,
} from '@/graphql/mypage';
import type {QueryMyWishlistsQueryVariables} from '@/shared/api/gql/graphql';
import {HttpClient} from '@/shared/lib/client';

export type WishlistRow = {
  id: string;
  productId: number;
  searchAfter?: string[] | null;
  product: {
    id: string;
    title: string;
    price?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    isPrivate: boolean;
    postedAt: string;
    hotDealType?: string | null;
    thumbnail?: string | null;
    isMyWishlist?: boolean | null;
    categoryId: number;
    mallName?: string | null;
    provider?: {nameKr?: string | null} | null;
  };
};

/** 찜 목록. web `shared/api/wishlist/wishlist.service.ts` */
export class MyWishlistService {
  static async getWishlists(variables: QueryMyWishlistsQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryMyWishlists,
      variables,
    );
    return (res.data?.wishlists ?? []) as WishlistRow[];
  }

  static async getWishlistCount() {
    const res = await HttpClient.withAccessToken().execute(
      QueryMyWishlistCount,
    );
    return res.data?.wishlistCount ?? 0;
  }

  static async addWishlist(variables: {productId: number}) {
    const res = await HttpClient.withAccessToken().execute(
      MutationAddMyWishlist,
      variables,
    );
    return res.data;
  }

  static async removeWishlist(variables: {productId: number}) {
    const res = await HttpClient.withAccessToken().execute(
      MutationRemoveMyWishlist,
      variables,
    );
    return res.data;
  }
}
