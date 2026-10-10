import { useApolloClient } from '@apollo/client/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ProductMappingTarget,
  ProductMappingVerificationStatus,
  QueryPendingVerificationsQuery,
  QueryPendingVerificationsQueryVariables,
} from '@/generated/gql/graphql';
import { QueryPendingVerifications } from '@/graphql/verification';
import { BrandProduct } from '@/hooks/graphql/brandProduct';
import { ignoreLazyRejection } from '@/hooks/graphql/options';

import { PendingVerificationItem } from '../../types';

import { ALL_VERIFICATION_STATUSES, PAGE_LIMIT } from './constants';
import { VerificationQueries } from './useVerificationQueries';

type Params = {
  fetchPendingVerifications: VerificationQueries['fetchPendingVerifications'];
  fetchPendingVerificationsTotalCountByBrandProduct: VerificationQueries['fetchPendingVerificationsTotalCountByBrandProduct'];
  selectedBrandProduct: BrandProduct | null;
  includeVerified: boolean;
};

// 우측 검증 목록 — 선택된 BrandProduct 기준 로딩·페이징과 항목별 승인/거절 선택.
export function useVerificationList({
  fetchPendingVerifications,
  fetchPendingVerificationsTotalCountByBrandProduct,
  selectedBrandProduct,
  includeVerified,
}: Params) {
  // ── 우측: 검증 대기 목록 상태 ──
  const [verificationItems, setVerificationItems] = useState<PendingVerificationItem[]>([]);
  // GraphQL 에러가 "매칭 항목이 없습니다"로 위장되지 않게 — 에러면 빈 목록 대신 사유를 띄운다.
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSearchAfter, setVerificationSearchAfter] = useState<string[] | null>(null);
  const [hasVerificationMore, setHasVerificationMore] = useState(true);
  const [isLoadingVerificationMore, setIsLoadingVerificationMore] = useState(false);
  const [isLoadingFirstPage, setIsLoadingFirstPage] = useState(false);

  // 첫 페이지 미리 받기 — 「확정 후 다음」을 누르면 다음 카탈로그 목록이 이미 와 있게.
  // 한 번 쓰면 버리고, 1분 넘은 건 쓰지 않는다(그 사이 새 매칭이 붙을 수 있다).
  const client = useApolloClient();
  const prefetchedRef = useRef(
    new Map<string, { at: number; promise: Promise<{ data?: QueryPendingVerificationsQuery }> }>(),
  );
  // 카탈로그를 빠르게 넘기면 늦게 온 이전 응답이 지금 목록을 덮지 않게
  const requestTokenRef = useRef(0);

  const statusFilter = useMemo(
    () =>
      includeVerified
        ? ALL_VERIFICATION_STATUSES
        : [ProductMappingVerificationStatus.PendingVerification],
    [includeVerified],
  );

  const queryFirstPage = useCallback(
    (brandProductId: number) =>
      client.query<QueryPendingVerificationsQuery, QueryPendingVerificationsQueryVariables>({
        query: QueryPendingVerifications,
        fetchPolicy: 'network-only',
        variables: {
          limit: PAGE_LIMIT,
          // brandProductId 는 서버에서 targetId 만 비교한다 — target 없이 보내면 같은 번호의
          // BRAND_ITEM 매핑이 섞인다(전체 개수 쿼리처럼 target 을 같이 준다)
          target: ProductMappingTarget.BrandProduct,
          brandProductId,
          verificationStatus: statusFilter,
        },
      }),
    [client, statusFilter],
  );

  const prefetchVerifications = useCallback(
    (brandProductId: number) => {
      const key = `${brandProductId}:${includeVerified}`;
      if (prefetchedRef.current.has(key)) return;
      const promise = queryFirstPage(brandProductId);
      promise.catch(() => {}); // 실패는 실제로 열 때 다시 받는다
      prefetchedRef.current.set(key, { at: Date.now(), promise });
    },
    [includeVerified, queryFirstPage],
  );

  const [itemSelections, setItemSelections] = useState<Record<string, boolean>>({});

  const currentItems = useMemo(() => {
    return verificationItems.map((item) => ({
      ...item,
      isSelected: itemSelections[item.id] ?? true,
    }));
  }, [verificationItems, itemSelections]);

  const selectedItems = currentItems.filter((item) => item.isSelected);
  const deselectedItems = currentItems.filter((item) => !item.isSelected);
  const stats = {
    total: currentItems.length,
    selected: selectedItems.length,
    deselected: deselectedItems.length,
  };

  // ─────────────────────────────────────────────
  // 데이터 변환 유틸 (GraphQL → PendingVerificationItem)
  // ─────────────────────────────────────────────

  const mapVerificationItem = useCallback(
    (item: any): PendingVerificationItem => ({
      id: item.id,
      productId: item.productId,
      brandProduct: item.brandProduct ?? null,
      product: item.product
        ? {
            title: item.product.title,
            thumbnail: item.product.thumbnail ?? null,
            price: item.product.price ?? null,
            url: item.product.url ?? null,
            provider: item.product.provider ? { name: item.product.provider.name } : null,
          }
        : null,
      danawaUrl: item.danawaUrl ?? null,
      createdAt: item.createdAt,
      searchAfter: item.searchAfter ?? null,
      isSelected: item.verificationStatus !== 'VERIFIED',
      verificationStatus: item.verificationStatus ?? null,
      verifiedBy: item.verifiedBy
        ? { id: item.verifiedBy.id, name: item.verifiedBy.name, email: item.verifiedBy.email }
        : null,
      verifiedAt: item.verifiedAt ?? null,
      matchingConfidence: item.matchingConfidence ?? null,
      matchingReasoning: item.matchingReasoning ?? null,
      aiSuggestion: item.aiSuggestion ?? null,
      aiSuggestionConfidence: item.aiSuggestionConfidence ?? null,
      aiSuggestionReason: item.aiSuggestionReason ?? null,
    }),
    [],
  );

  // ─────────────────────────────────────────────
  // 검증 대기 목록 로딩
  // ─────────────────────────────────────────────

  const loadVerificationsForBrandProduct = useCallback(
    async (brandProductId: number) => {
      const token = ++requestTokenRef.current;
      // 이전 카탈로그 항목을 남겨 두면 로딩 중에 확정을 눌러 엉뚱한 딜이 처리된다 — 비우고 받는다
      setVerificationItems([]);
      setVerificationSearchAfter(null);
      setHasVerificationMore(true);
      setVerificationError(null);
      setIsLoadingFirstPage(true);

      const key = `${brandProductId}:${includeVerified}`;
      const cached = prefetchedRef.current.get(key);
      prefetchedRef.current.delete(key);
      try {
        const result = await (cached && Date.now() - cached.at < 60_000
          ? cached.promise
          : queryFirstPage(brandProductId));
        if (token !== requestTokenRef.current) return;
        if (result.data?.pendingVerifications) {
          const items = result.data.pendingVerifications.map(mapVerificationItem);
          setVerificationItems(items);

          const initialSelections: Record<string, boolean> = {};
          items.forEach((item) => {
            initialSelections[item.id] = item.verificationStatus === 'REJECTED' ? false : true;
          });
          setItemSelections(initialSelections);

          if (items.length > 0) {
            setVerificationSearchAfter(items[items.length - 1].searchAfter);
            setHasVerificationMore(items.length >= PAGE_LIMIT);
          } else {
            setHasVerificationMore(false);
          }
        }
      } catch (error) {
        if (token !== requestTokenRef.current) return;
        // GraphQL 에러가 "매칭 항목이 없습니다"로 위장되지 않게 사유를 띄운다
        console.error('Failed to load verifications:', error);
        setVerificationError((error as Error).message);
        setVerificationItems([]);
      } finally {
        if (token === requestTokenRef.current) setIsLoadingFirstPage(false);
      }
    },
    [includeVerified, queryFirstPage, mapVerificationItem],
  );

  useEffect(() => {
    if (selectedBrandProduct) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 선택한 카탈로그가 바뀌면 검증 목록·개수를 서버에서 다시 받는 데이터 조회 effect 다.
      loadVerificationsForBrandProduct(parseInt(selectedBrandProduct.id));
      fetchPendingVerificationsTotalCountByBrandProduct({
        variables: {
          target: ProductMappingTarget.BrandProduct,
          brandProductId: parseInt(selectedBrandProduct.id),
          verificationStatus: statusFilter,
        },
      }).catch(ignoreLazyRejection);
    }
  }, [
    selectedBrandProduct,
    statusFilter,
    fetchPendingVerificationsTotalCountByBrandProduct,
    loadVerificationsForBrandProduct,
  ]);

  // ─────────────────────────────────────────────
  // 추가 로딩 (페이징)
  // ─────────────────────────────────────────────

  const loadMoreVerifications = useCallback(async () => {
    if (
      isLoadingVerificationMore ||
      !hasVerificationMore ||
      !verificationSearchAfter ||
      !selectedBrandProduct
    )
      return;
    setIsLoadingVerificationMore(true);
    try {
      const result = await fetchPendingVerifications({
        variables: {
          limit: PAGE_LIMIT,
          searchAfter: verificationSearchAfter,
          target: ProductMappingTarget.BrandProduct,
          brandProductId: parseInt(selectedBrandProduct.id),
          verificationStatus: statusFilter,
        },
      });
      if (result.data?.pendingVerifications) {
        const newItems = result.data.pendingVerifications.map(mapVerificationItem);
        if (newItems.length > 0) {
          setVerificationItems((prev) => [...prev, ...newItems]);
          setItemSelections((prev) => {
            const newSelections = { ...prev };
            newItems.forEach((item) => {
              newSelections[item.id] = true;
            });
            return newSelections;
          });
          setVerificationSearchAfter(newItems[newItems.length - 1].searchAfter);
          setHasVerificationMore(newItems.length >= PAGE_LIMIT);
        } else {
          setHasVerificationMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more verifications:', error);
      setHasVerificationMore(false);
    } finally {
      setIsLoadingVerificationMore(false);
    }
  }, [
    isLoadingVerificationMore,
    hasVerificationMore,
    verificationSearchAfter,
    selectedBrandProduct,
    statusFilter,
    fetchPendingVerifications,
    mapVerificationItem,
  ]);

  // ─────────────────────────────────────────────
  // 선택
  // ─────────────────────────────────────────────

  const toggleItemSelection = useCallback((itemId: string) => {
    setItemSelections((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const selectAll = useCallback(() => {
    setItemSelections((prev) => {
      const newSelections = { ...prev };
      verificationItems.forEach((item) => {
        newSelections[item.id] = true;
      });
      return newSelections;
    });
  }, [verificationItems]);

  const deselectAll = useCallback(() => {
    setItemSelections((prev) => {
      const newSelections = { ...prev };
      verificationItems.forEach((item) => {
        newSelections[item.id] = false;
      });
      return newSelections;
    });
  }, [verificationItems]);

  return {
    verificationItems,
    setVerificationItems,
    verificationError,
    hasVerificationMore,
    isLoadingVerificationMore,
    itemSelections,
    setItemSelections,
    currentItems,
    selectedItems,
    deselectedItems,
    stats,
    isLoadingFirstPage,
    loadVerificationsForBrandProduct,
    prefetchVerifications,
    loadMoreVerifications,
    toggleItemSelection,
    selectAll,
    deselectAll,
  };
}
