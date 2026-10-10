import { ProductMappingMatchStatus, ProductMappingTarget } from '@/generated/gql/graphql';
import {
  useGetBrandItemsByMatchCountTotalCount,
  useGetBrandItemsByMatchCountTotalCountLazy,
  useGetBrandItemsOrderByTotalMatchCount,
  useGetBrandItemsOrderByTotalMatchCountLazy,
  useGetBrandProductsOrderByMatchCountLazy,
} from '@/hooks/graphql/brandProduct';
import {
  useBatchVerifyProductMapping,
  useGetPendingVerificationsLazy,
  useGetPendingVerificationsTotalCount,
  useGetPendingVerificationsTotalCountLazy,
  useRemoveProductMapping,
} from '@/hooks/graphql/verification';

import { PAGE_LIMIT } from './constants';

// Apollo 훅은 원본과 같은 순서·같은 위치(모든 useEffect 앞)에서 호출돼야 해서 한 덩어리로 둔다.
export function useVerificationQueries() {
  // ── API Hooks ──
  const { data: brandItemData, loading: brandItemLoading } = useGetBrandItemsOrderByTotalMatchCount(
    { limit: PAGE_LIMIT },
  );
  const [fetchMoreBrandItems] = useGetBrandItemsOrderByTotalMatchCountLazy();
  const [fetchMoreBrandProducts] = useGetBrandProductsOrderByMatchCountLazy();
  const [fetchPendingVerifications] = useGetPendingVerificationsLazy();
  const [batchVerifyMutation] = useBatchVerifyProductMapping();
  const [removeMappingMutation] = useRemoveProductMapping();

  // Total count hooks
  const { data: brandItemsTotalCountData } = useGetBrandItemsByMatchCountTotalCount();
  const { data: pendingVerificationsTotalCountData } = useGetPendingVerificationsTotalCount({
    matchStatus: [ProductMappingMatchStatus.Matched],
    target: ProductMappingTarget.BrandProduct,
  });
  const [fetchBrandItemSearchTotalCount, { data: brandItemSearchTotalCountData }] =
    useGetBrandItemsByMatchCountTotalCountLazy();
  const [
    fetchPendingVerificationsTotalCountByBrandProduct,
    { data: pendingVerificationsTotalCountByBrandProductData },
  ] = useGetPendingVerificationsTotalCountLazy();

  return {
    brandItemData,
    brandItemLoading,
    fetchMoreBrandItems,
    fetchMoreBrandProducts,
    fetchPendingVerifications,
    batchVerifyMutation,
    removeMappingMutation,
    brandItemsTotalCountData,
    pendingVerificationsTotalCountData,
    fetchBrandItemSearchTotalCount,
    brandItemSearchTotalCountData,
    fetchPendingVerificationsTotalCountByBrandProduct,
    pendingVerificationsTotalCountByBrandProductData,
  };
}

export type VerificationQueries = ReturnType<typeof useVerificationQueries>;
