import { useCallback, useState } from 'react';

import { BrandItem } from '@/hooks/graphql/brandProduct';

import { PAGE_LIMIT } from './constants';
import { VerificationQueries } from './useVerificationQueries';

type Params = {
  brandItemData: VerificationQueries['brandItemData'];
  fetchMoreBrandItems: VerificationQueries['fetchMoreBrandItems'];
  debouncedSearchQuery: string;
};

// 좌측 브랜드 아이템 목록 — 첫 페이지 반영과 커서 페이징.
export function useBrandItemList({
  brandItemData,
  fetchMoreBrandItems,
  debouncedSearchQuery,
}: Params) {
  // ── 좌측: 브랜드 아이템 목록 상태 ──
  const [allBrandItems, setAllBrandItems] = useState<BrandItem[]>([]);
  const [brandItemSearchAfter, setBrandItemSearchAfter] = useState<string[] | null>(null);
  const [hasBrandItemMore, setHasBrandItemMore] = useState(true);
  const [isLoadingBrandItemMore, setIsLoadingBrandItemMore] = useState(false);

  // ─────────────────────────────────────────────
  // 브랜드 아이템 데이터 로딩
  // ─────────────────────────────────────────────

  // 첫 페이지 응답이 (다시) 오면 목록·커서를 그 값으로 맞춘다 — effect 대신 렌더 중 비교로.
  const [syncedBrandItemData, setSyncedBrandItemData] = useState<typeof brandItemData>(undefined);
  if (brandItemData !== syncedBrandItemData) {
    setSyncedBrandItemData(brandItemData);
    if (brandItemData?.brandItemsOrderByTotalMatchCount) {
      const items = brandItemData.brandItemsOrderByTotalMatchCount;
      setAllBrandItems(items);
      if (items.length > 0) {
        setBrandItemSearchAfter(items[items.length - 1].searchAfter ?? null);
        setHasBrandItemMore(items.length >= PAGE_LIMIT);
      } else {
        setHasBrandItemMore(false);
      }
    }
  }

  // ─────────────────────────────────────────────
  // 추가 로딩 (페이징)
  // ─────────────────────────────────────────────

  const loadMoreBrandItems = useCallback(async () => {
    if (isLoadingBrandItemMore || !hasBrandItemMore || !brandItemSearchAfter) return;
    setIsLoadingBrandItemMore(true);
    try {
      const result = await fetchMoreBrandItems({
        variables: {
          limit: PAGE_LIMIT,
          searchAfter: brandItemSearchAfter,
          title: debouncedSearchQuery || undefined,
        },
      });
      if (result.data?.brandItemsOrderByTotalMatchCount) {
        const newItems = result.data.brandItemsOrderByTotalMatchCount;
        if (newItems.length > 0) {
          setAllBrandItems((prev) => [...prev, ...newItems]);
          setBrandItemSearchAfter(newItems[newItems.length - 1].searchAfter ?? null);
          setHasBrandItemMore(newItems.length >= PAGE_LIMIT);
        } else {
          setHasBrandItemMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more brand items:', error);
      setHasBrandItemMore(false);
    } finally {
      setIsLoadingBrandItemMore(false);
    }
  }, [
    isLoadingBrandItemMore,
    hasBrandItemMore,
    brandItemSearchAfter,
    fetchMoreBrandItems,
    debouncedSearchQuery,
  ]);

  return {
    allBrandItems,
    setAllBrandItems,
    setBrandItemSearchAfter,
    hasBrandItemMore,
    setHasBrandItemMore,
    isLoadingBrandItemMore,
    loadMoreBrandItems,
  };
}
