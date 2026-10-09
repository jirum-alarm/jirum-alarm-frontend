import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { BrandItem, BrandProduct } from '@/hooks/graphql/brandProduct';
import { ignoreLazyRejection } from '@/hooks/graphql/options';

import { PAGE_LIMIT } from './constants';
import { VerificationQueries } from './useVerificationQueries';

type Params = {
  debouncedSearchQuery: string;
  fetchMoreBrandItems: VerificationQueries['fetchMoreBrandItems'];
  fetchBrandItemSearchTotalCount: VerificationQueries['fetchBrandItemSearchTotalCount'];
  brandItemData: VerificationQueries['brandItemData'];
  highlightBrandItem: (item: BrandItem) => void;
  setSelectedBrandItem: Dispatch<SetStateAction<BrandItem | null>>;
  setSelectedBrandProduct: Dispatch<SetStateAction<BrandProduct | null>>;
  setSelectedBrandItemIndex: Dispatch<SetStateAction<number>>;
  setBrandItemSearchAfter: Dispatch<SetStateAction<string[] | null>>;
  setHasBrandItemMore: Dispatch<SetStateAction<boolean>>;
  setExpandedItems: Dispatch<SetStateAction<BrandProduct[]>>;
  setAllBrandItems: Dispatch<SetStateAction<BrandItem[]>>;
};

// 확정된 검색어가 바뀌면 좌측 목록을 첫 페이지부터 다시 받고 선택을 초기화한다.
export function useBrandItemSearchSync({
  debouncedSearchQuery,
  fetchMoreBrandItems,
  fetchBrandItemSearchTotalCount,
  brandItemData,
  highlightBrandItem,
  setSelectedBrandItem,
  setSelectedBrandProduct,
  setSelectedBrandItemIndex,
  setBrandItemSearchAfter,
  setHasBrandItemMore,
  setExpandedItems,
  setAllBrandItems,
}: Params) {
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchBrandItems = async () => {
      setIsSearching(true);
      setSelectedBrandItem(null);
      setSelectedBrandProduct(null);
      setSelectedBrandItemIndex(0);
      setBrandItemSearchAfter(null);
      setHasBrandItemMore(true);
      setExpandedItems([]);
      try {
        const result = await fetchMoreBrandItems({
          variables: { limit: PAGE_LIMIT, title: debouncedSearchQuery || undefined },
        });
        if (result.data?.brandItemsOrderByTotalMatchCount) {
          const items = result.data.brandItemsOrderByTotalMatchCount;
          setAllBrandItems(items);
          if (items.length > 0) {
            setBrandItemSearchAfter(items[items.length - 1].searchAfter ?? null);
            setHasBrandItemMore(items.length >= PAGE_LIMIT);
            highlightBrandItem(items[0]);
          } else {
            setHasBrandItemMore(false);
          }
        }
        fetchBrandItemSearchTotalCount({
          variables: { title: debouncedSearchQuery || undefined },
        }).catch(ignoreLazyRejection);
      } catch (error) {
        console.error('Failed to search brand items:', error);
      } finally {
        setIsSearching(false);
      }
    };
    if (brandItemData) searchBrandItems();
    // setter 들은 부모 useState 원본이라 안정 — 원본 의존성 배열을 그대로 유지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearchQuery,
    fetchMoreBrandItems,
    fetchBrandItemSearchTotalCount,
    brandItemData,
    highlightBrandItem,
  ]);

  return { isSearching };
}
