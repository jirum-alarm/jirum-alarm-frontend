'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ProductMappingMatchStatus,
  ProductMappingTarget,
  ProductMappingVerificationStatus,
} from '@/generated/gql/graphql';
import {
  BrandProduct,
  useGetBrandProductsByMatchCountTotalCount,
  useGetBrandProductsByMatchCountTotalCountLazy,
  useGetBrandProductsOrderByMatchCount,
  useGetBrandProductsOrderByMatchCountLazy,
} from '@/hooks/graphql/brandProduct';
import {
  useBatchVerifyProductMapping,
  useGetPendingVerificationsLazy,
  useGetPendingVerificationsTotalCount,
  useGetPendingVerificationsTotalCountLazy,
} from '@/hooks/graphql/verification';

import { useUndoStack } from '../hooks/useUndoStack';
import { ImageModalState, PendingVerificationItem, ToastState } from '../types';

import ImageCompareModal from './ImageCompareModal';
import KeyboardShortcutModal from './KeyboardShortcutModal';
import Toast from './Toast';
import VerificationItem from './VerificationItem';

const PAGE_LIMIT = 20;

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────

const VerificationGroupByView = () => {
  // ── 좌측: 브랜드 상품 목록 상태 ──
  const [allBrandProducts, setAllBrandProducts] = useState<BrandProduct[]>([]);
  const [brandProductSearchAfter, setBrandProductSearchAfter] = useState<string[] | null>(null);
  const [hasBrandProductMore, setHasBrandProductMore] = useState(true);
  const [isLoadingBrandProductMore, setIsLoadingBrandProductMore] = useState(false);

  // ── 우측: 검증 대기 목록 상태 ──
  const [verificationItems, setVerificationItems] = useState<PendingVerificationItem[]>([]);
  const [verificationSearchAfter, setVerificationSearchAfter] = useState<string[] | null>(null);
  const [hasVerificationMore, setHasVerificationMore] = useState(true);
  const [isLoadingVerificationMore, setIsLoadingVerificationMore] = useState(false);

  // ── 선택 상태 ──
  const [selectedBrandProduct, setSelectedBrandProduct] = useState<BrandProduct | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [itemSelections, setItemSelections] = useState<Record<string, boolean>>({});
  const [focusedPostIndex, setFocusedPostIndex] = useState<number>(-1);
  const [isLeftPanelFocused, setIsLeftPanelFocused] = useState(true);

  // ── Expand 상태 ──
  const [expandedBrandProductId, setExpandedBrandProductId] = useState<string | null>(null);
  const [expandedBrandItemId, setExpandedBrandItemId] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<BrandProduct[]>([]);
  const [isLoadingExpanded, setIsLoadingExpanded] = useState(false);
  const [expandedSelectedIndex, setExpandedSelectedIndex] = useState(0);

  // ── 검색 상태 ──
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // ── 탭 / 필터 상태 ──
  const [activeTab, setActiveTab] = useState<'brands' | 'details'>('brands');
  const [includeVerified, setIncludeVerified] = useState(true);

  // ── 모달 / 토스트 상태 ──
  const [imageModalData, setImageModalData] = useState<ImageModalState>({
    isOpen: false,
    danawaImage: '',
    danawaTitle: '',
    communityTitle: '',
  });
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    type: 'success',
  });
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  // ── #7: Undo 훅 ──
  const { pushUndo, undo, canUndo, isUndoing } = useUndoStack();

  // ── Refs ──
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const searchThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leftScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── API Hooks ──
  const { data: brandProductData, loading: brandProductLoading } =
    useGetBrandProductsOrderByMatchCount({ limit: PAGE_LIMIT });
  const [fetchMoreBrandProducts] = useGetBrandProductsOrderByMatchCountLazy();
  const [fetchPendingVerifications, { loading: pendingLoading }] = useGetPendingVerificationsLazy();
  const [batchVerifyMutation] = useBatchVerifyProductMapping();

  // Total count hooks
  const { data: brandProductsTotalCountData } = useGetBrandProductsByMatchCountTotalCount();
  const { data: pendingVerificationsTotalCountData } = useGetPendingVerificationsTotalCount({
    matchStatus: [ProductMappingMatchStatus.Matched],
    target: ProductMappingTarget.BrandProduct,
  });
  const [fetchBrandItemTotalCount, { data: brandItemTotalCountData }] =
    useGetBrandProductsByMatchCountTotalCountLazy();
  const [
    fetchPendingVerificationsTotalCountByBrandProduct,
    { data: pendingVerificationsTotalCountByBrandProductData },
  ] = useGetPendingVerificationsTotalCountLazy();

  // ── Computed ──
  const filteredBrandProducts = allBrandProducts;

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
    }),
    [],
  );

  // ─────────────────────────────────────────────
  // 브랜드 상품 데이터 로딩
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (brandProductData?.brandProductsOrderByMatchCount) {
      const items = brandProductData.brandProductsOrderByMatchCount;
      setAllBrandProducts(items);
      if (items.length > 0) {
        setBrandProductSearchAfter(items[items.length - 1].searchAfter);
        setHasBrandProductMore(items.length >= PAGE_LIMIT);
      } else {
        setHasBrandProductMore(false);
      }
    }
  }, [brandProductData]);

  useEffect(() => {
    if (allBrandProducts.length > 0 && !selectedBrandProduct) {
      setSelectedBrandProduct(allBrandProducts[0]);
    }
  }, [allBrandProducts, selectedBrandProduct]);

  // ─────────────────────────────────────────────
  // 검증 대기 목록 로딩
  // ─────────────────────────────────────────────

  const loadVerificationsForBrandProduct = useCallback(
    async (brandProductId: number) => {
      setVerificationSearchAfter(null);
      setHasVerificationMore(true);
      try {
        const result = await fetchPendingVerifications({
          variables: {
            limit: PAGE_LIMIT,
            brandProductId,
            verificationStatus: includeVerified
              ? undefined
              : [ProductMappingVerificationStatus.PendingVerification],
          },
        });
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
        console.error('Failed to load verifications:', error);
      }
    },
    [fetchPendingVerifications, includeVerified, mapVerificationItem],
  );

  useEffect(() => {
    if (selectedBrandProduct) {
      loadVerificationsForBrandProduct(parseInt(selectedBrandProduct.id));
      fetchPendingVerificationsTotalCountByBrandProduct({
        variables: {
          brandProductId: parseInt(selectedBrandProduct.id),
          verificationStatus: includeVerified
            ? undefined
            : [ProductMappingVerificationStatus.PendingVerification],
        },
      });
    }
  }, [
    selectedBrandProduct,
    includeVerified,
    fetchPendingVerificationsTotalCountByBrandProduct,
    loadVerificationsForBrandProduct,
  ]);

  // ─────────────────────────────────────────────
  // 추가 로딩 (페이징)
  // ─────────────────────────────────────────────

  const loadMoreBrandProducts = useCallback(async () => {
    if (isLoadingBrandProductMore || !hasBrandProductMore || !brandProductSearchAfter) return;
    setIsLoadingBrandProductMore(true);
    try {
      const result = await fetchMoreBrandProducts({
        variables: {
          limit: PAGE_LIMIT,
          searchAfter: brandProductSearchAfter,
          title: debouncedSearchQuery || undefined,
        },
      });
      if (result.data?.brandProductsOrderByMatchCount) {
        const newItems = result.data.brandProductsOrderByMatchCount;
        if (newItems.length > 0) {
          setAllBrandProducts((prev) => [...prev, ...newItems]);
          setBrandProductSearchAfter(newItems[newItems.length - 1].searchAfter);
          setHasBrandProductMore(newItems.length >= PAGE_LIMIT);
        } else {
          setHasBrandProductMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more brand products:', error);
      setHasBrandProductMore(false);
    } finally {
      setIsLoadingBrandProductMore(false);
    }
  }, [
    isLoadingBrandProductMore,
    hasBrandProductMore,
    brandProductSearchAfter,
    fetchMoreBrandProducts,
    debouncedSearchQuery,
  ]);

  const loadExpandedItems = useCallback(
    async (brandItemId: number) => {
      setIsLoadingExpanded(true);
      try {
        const result = await fetchMoreBrandProducts({
          variables: { limit: 50, brandItemId },
        });
        if (result.data?.brandProductsOrderByMatchCount) {
          setExpandedItems(result.data.brandProductsOrderByMatchCount);
          setExpandedSelectedIndex(0);
        }
      } catch (error) {
        console.error('Failed to load expanded items:', error);
      } finally {
        setIsLoadingExpanded(false);
      }
    },
    [fetchMoreBrandProducts],
  );

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
          brandProductId: parseInt(selectedBrandProduct.id),
          verificationStatus: includeVerified
            ? undefined
            : [ProductMappingVerificationStatus.PendingVerification],
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
    includeVerified,
    fetchPendingVerifications,
    mapVerificationItem,
  ]);

  // ─────────────────────────────────────────────
  // 검색
  // ─────────────────────────────────────────────

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchThrottleRef.current) clearTimeout(searchThrottleRef.current);
    searchThrottleRef.current = setTimeout(() => setDebouncedSearchQuery(value), 300);
  }, []);

  useEffect(() => {
    const searchBrandProducts = async () => {
      setIsSearching(true);
      setSelectedBrandProduct(null);
      setSelectedProductIndex(0);
      setBrandProductSearchAfter(null);
      setHasBrandProductMore(true);
      setExpandedBrandProductId(null);
      setExpandedBrandItemId(null);
      setExpandedItems([]);
      try {
        const result = await fetchMoreBrandProducts({
          variables: { limit: PAGE_LIMIT, title: debouncedSearchQuery || undefined },
        });
        if (result.data?.brandProductsOrderByMatchCount) {
          const items = result.data.brandProductsOrderByMatchCount;
          setAllBrandProducts(items);
          if (items.length > 0) {
            setBrandProductSearchAfter(items[items.length - 1].searchAfter);
            setHasBrandProductMore(items.length >= PAGE_LIMIT);
            setSelectedBrandProduct(items[0]);
          } else {
            setHasBrandProductMore(false);
          }
        }
        fetchBrandItemTotalCount({
          variables: { title: debouncedSearchQuery || undefined },
        });
      } catch (error) {
        console.error('Failed to search brand products:', error);
      } finally {
        setIsSearching(false);
      }
    };
    if (brandProductData) searchBrandProducts();
  }, [debouncedSearchQuery, fetchMoreBrandProducts, fetchBrandItemTotalCount, brandProductData]);

  // ─────────────────────────────────────────────
  // 탭 / 확장
  // ─────────────────────────────────────────────

  useEffect(() => {
    setIsLeftPanelFocused(true);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'brands' && selectedBrandProduct) {
      const index = allBrandProducts.findIndex((bp) => bp.id === selectedBrandProduct.id);
      if (index >= 0) setSelectedProductIndex(index);
    }
  }, [selectedBrandProduct, allBrandProducts, activeTab]);

  const toggleExpand = useCallback(
    (brandProduct: BrandProduct) => {
      if (expandedBrandProductId === brandProduct.id) {
        setExpandedBrandProductId(null);
        setExpandedBrandItemId(null);
        setExpandedItems([]);
        setExpandedSelectedIndex(0);
      } else {
        setExpandedBrandProductId(brandProduct.id);
        setExpandedBrandItemId(brandProduct.brandItemId);
        loadExpandedItems(brandProduct.brandItemId);
        fetchBrandItemTotalCount({ variables: { brandItemId: brandProduct.brandItemId } });
        setActiveTab('details');
      }
    },
    [expandedBrandProductId, loadExpandedItems, fetchBrandItemTotalCount],
  );

  // ─────────────────────────────────────────────
  // 선택 / 확정
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

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ isVisible: true, message, type });
    },
    [],
  );

  const handleConfirmMatching = useCallback(async () => {
    const itemsToApprove = selectedItems.filter((item) => item.verificationStatus !== 'VERIFIED');
    const itemsToReject = deselectedItems.filter((item) => item.verificationStatus !== 'REJECTED');
    const totalCount = itemsToApprove.length + itemsToReject.length;

    if (totalCount === 0) {
      showToast('변경 사항이 없습니다.', 'info');
      return;
    }

    // #7: Undo를 위해 현재 상태 저장
    const previousSelections = { ...itemSelections };
    const previousStatuses: Record<string, string | null> = {};
    verificationItems.forEach((item) => {
      previousStatuses[item.id] = item.verificationStatus;
    });

    try {
      if (itemsToApprove.length > 0) {
        await batchVerifyMutation({
          variables: {
            productMappingIds: itemsToApprove.map((item) => parseInt(item.id)),
            result: ProductMappingVerificationStatus.Verified,
          },
        });
      }
      if (itemsToReject.length > 0) {
        await batchVerifyMutation({
          variables: {
            productMappingIds: itemsToReject.map((item) => parseInt(item.id)),
            result: ProductMappingVerificationStatus.Rejected,
          },
        });
      }

      // #7: Undo 스택에 추가
      pushUndo({
        approvedIds: itemsToApprove.map((i) => i.id),
        rejectedIds: itemsToReject.map((i) => i.id),
        brandProductId: selectedBrandProduct?.id ?? '',
        previousSelections,
        previousStatuses,
        timestamp: Date.now(),
      });

      // 로컬 상태 업데이트 (optimistic)
      setVerificationItems((prev) =>
        prev.map((item) => {
          if (itemsToApprove.some((a) => a.id === item.id)) {
            return { ...item, verificationStatus: 'VERIFIED' };
          }
          if (itemsToReject.some((r) => r.id === item.id)) {
            return { ...item, verificationStatus: 'REJECTED' };
          }
          return item;
        }),
      );

      showToast(
        `저장 완료! ✓ ${itemsToApprove.length}건 승인${itemsToReject.length > 0 ? ` · ✗ ${itemsToReject.length}건 제외` : ''}`,
        'success',
      );

      // pendingVerificationCount 업데이트
      const parentIdToUpdate =
        activeTab === 'details' ? expandedBrandProductId : selectedBrandProduct?.id;
      if (parentIdToUpdate) {
        setAllBrandProducts((prev) =>
          prev.map((bp) =>
            bp.id === parentIdToUpdate
              ? {
                  ...bp,
                  pendingVerificationCount: Math.max(0, bp.pendingVerificationCount - totalCount),
                }
              : bp,
          ),
        );
      }
      if (activeTab === 'details') {
        setExpandedItems((prev) =>
          prev.map((bp) =>
            bp.id === selectedBrandProduct?.id
              ? {
                  ...bp,
                  pendingVerificationCount: Math.max(0, bp.pendingVerificationCount - totalCount),
                }
              : bp,
          ),
        );
      }
      setIncludeVerified(true);
    } catch (error) {
      showToast('저장 중 오류가 발생했습니다.', 'error');
      console.error(error);
    }
  }, [
    selectedItems,
    deselectedItems,
    selectedBrandProduct,
    showToast,
    batchVerifyMutation,
    activeTab,
    expandedBrandProductId,
    itemSelections,
    verificationItems,
    pushUndo,
  ]);

  // #7: 실행 취소 핸들러
  const handleUndo = useCallback(async () => {
    const undoneAction = await undo();
    if (undoneAction) {
      // 로컬 상태를 이전 상태로 복원
      setVerificationItems((prev) =>
        prev.map((item) => ({
          ...item,
          verificationStatus: undoneAction.previousStatuses[item.id] ?? item.verificationStatus,
        })),
      );
      setItemSelections(undoneAction.previousSelections);
      showToast('실행 취소 완료', 'info');

      // pendingVerificationCount 복원
      const restoredCount = undoneAction.approvedIds.length + undoneAction.rejectedIds.length;
      if (undoneAction.brandProductId) {
        setAllBrandProducts((prev) =>
          prev.map((bp) =>
            bp.id === undoneAction.brandProductId
              ? { ...bp, pendingVerificationCount: bp.pendingVerificationCount + restoredCount }
              : bp,
          ),
        );
      }
    } else if (!isUndoing) {
      showToast('취소할 작업이 없습니다.', 'info');
    }
  }, [undo, isUndoing, showToast]);

  // ─────────────────────────────────────────────
  // 핸들러
  // ─────────────────────────────────────────────

  const handleItemClick = useCallback(
    (idx: number) => {
      setFocusedPostIndex(idx);
      setIsLeftPanelFocused(false);
      if (idx >= currentItems.length - 3 && hasVerificationMore && !isLoadingVerificationMore) {
        loadMoreVerifications();
      }
    },
    [currentItems.length, hasVerificationMore, isLoadingVerificationMore, loadMoreVerifications],
  );

  // #1: danawaUrl도 같이 전달
  const handleImageClick = useCallback(
    (thumbnail: string, title: string) => {
      if (!selectedBrandProduct) return;

      // 현재 포커스된 아이템의 danawaUrl 가져오기
      const focusedItem = verificationItems[focusedPostIndex];

      setImageModalData({
        isOpen: true,
        danawaImage: '',
        danawaTitle: `${selectedBrandProduct.brandName} ${selectedBrandProduct.productName}`,
        danawaUrl: focusedItem?.danawaUrl ?? undefined,
        communityImage: thumbnail || undefined,
        communityTitle: title,
      });
    },
    [selectedBrandProduct, verificationItems, focusedPostIndex],
  );

  const handleConfirmAndNext = useCallback(async () => {
    await handleConfirmMatching();
    if (activeTab === 'details') {
      const nextExpandedIndex = expandedSelectedIndex + 1;
      if (nextExpandedIndex < expandedItems.length) {
        setSelectedBrandProduct(expandedItems[nextExpandedIndex]);
        setExpandedSelectedIndex(nextExpandedIndex);
      } else {
        setActiveTab('brands');
      }
    } else {
      const nextIndex = selectedProductIndex + 1;
      if (nextIndex < filteredBrandProducts.length) {
        setSelectedBrandProduct(filteredBrandProducts[nextIndex]);
        setSelectedProductIndex(nextIndex);
      }
    }
    setFocusedPostIndex(-1);
    setIsLeftPanelFocused(true);
  }, [
    handleConfirmMatching,
    activeTab,
    expandedSelectedIndex,
    expandedItems,
    selectedProductIndex,
    filteredBrandProducts,
  ]);

  // ─────────────────────────────────────────────
  // 키보드 네비게이션
  // ─────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (imageModalData.isOpen || isShortcutModalOpen) return;

      const isInSearchInput = document.activeElement?.tagName === 'INPUT';
      const isInTextarea = document.activeElement?.tagName === 'TEXTAREA';

      // 검색창에서 ArrowDown → 목록으로 이동
      if (isInSearchInput && e.key === 'ArrowDown') {
        e.preventDefault();
        (document.activeElement as HTMLElement).blur();
        setIsLeftPanelFocused(true);
        if (filteredBrandProducts.length > 0 && selectedProductIndex < 0) {
          setSelectedProductIndex(0);
          setSelectedBrandProduct(filteredBrandProducts[0]);
        }
        return;
      }

      if (isInSearchInput || isInTextarea) {
        if (e.key === 'Escape') (document.activeElement as HTMLElement).blur();
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (isLeftPanelFocused) {
            if (activeTab === 'brands') {
              setSelectedProductIndex((prev) => {
                const next = Math.min(prev + 1, filteredBrandProducts.length - 1);
                setSelectedBrandProduct(filteredBrandProducts[next]);
                return next;
              });
            } else if (activeTab === 'details' && expandedItems.length > 0) {
              setExpandedSelectedIndex((prev) => {
                const next = Math.min(prev + 1, expandedItems.length - 1);
                setSelectedBrandProduct(expandedItems[next]);
                return next;
              });
            }
          } else {
            setFocusedPostIndex((prev) => Math.min(prev + 1, verificationItems.length - 1));
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (isLeftPanelFocused) {
            if (activeTab === 'brands') {
              setSelectedProductIndex((prev) => {
                const next = Math.max(prev - 1, 0);
                setSelectedBrandProduct(filteredBrandProducts[next]);
                return next;
              });
            } else if (activeTab === 'details' && expandedItems.length > 0) {
              setExpandedSelectedIndex((prev) => {
                const next = Math.max(prev - 1, 0);
                setSelectedBrandProduct(expandedItems[next]);
                return next;
              });
            }
          } else {
            setFocusedPostIndex((prev) => Math.max(prev - 1, 0));
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (isLeftPanelFocused && verificationItems.length > 0) {
            setIsLeftPanelFocused(false);
            setFocusedPostIndex(0);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (!isLeftPanelFocused) {
            setIsLeftPanelFocused(true);
            setFocusedPostIndex(-1);
          } else if (activeTab === 'details') {
            setActiveTab('brands');
            setIsLeftPanelFocused(true);
            setFocusedPostIndex(-1);
            setExpandedBrandProductId(null);
            setExpandedBrandItemId(null);
            setExpandedItems([]);
            setExpandedSelectedIndex(0);
            setSelectedBrandProduct((prevSelected) => {
              if (prevSelected) {
                const index = filteredBrandProducts.findIndex((bp) => bp.id === prevSelected.id);
                if (index >= 0) setSelectedProductIndex(index);
              }
              return prevSelected;
            });
          }
          break;

        case ' ':
          e.preventDefault();
          if (isLeftPanelFocused) {
            const currentProduct =
              activeTab === 'brands'
                ? filteredBrandProducts[selectedProductIndex]
                : expandedItems[expandedSelectedIndex];
            if (activeTab === 'brands' && currentProduct) {
              toggleExpand(currentProduct);
            } else if (activeTab === 'details') {
              setActiveTab('brands');
              setIsLeftPanelFocused(true);
              setFocusedPostIndex(-1);
              setExpandedBrandProductId(null);
              setExpandedBrandItemId(null);
              setExpandedItems([]);
              setExpandedSelectedIndex(0);
            }
          } else {
            const currentItem = verificationItems[focusedPostIndex];
            if (currentItem) toggleItemSelection(currentItem.id);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            handleConfirmAndNext();
          } else {
            handleConfirmMatching();
          }
          break;

        case 'a':
        case 'A':
          if (e.shiftKey) {
            e.preventDefault();
            selectAll();
          }
          break;

        case 'n':
        case 'N':
          e.preventDefault();
          deselectAll();
          break;

        case 'i':
        case 'I':
          e.preventDefault();
          if (!isLeftPanelFocused && verificationItems[focusedPostIndex] && selectedBrandProduct) {
            const item = verificationItems[focusedPostIndex];
            setImageModalData({
              isOpen: true,
              danawaImage: '',
              danawaTitle: `${selectedBrandProduct.brandName} ${selectedBrandProduct.productName}`,
              danawaUrl: item.danawaUrl ?? undefined,
              communityImage: item.product?.thumbnail || undefined,
              communityTitle: item.product?.title || '',
            });
          }
          break;

        // #7: Ctrl+Z → 실행 취소
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;

        // #4: ? → 단축키 도움말
        case '?':
          e.preventDefault();
          setIsShortcutModalOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isLeftPanelFocused,
    activeTab,
    filteredBrandProducts,
    expandedItems,
    verificationItems,
    handleConfirmMatching,
    handleConfirmAndNext,
    toggleExpand,
    toggleItemSelection,
    selectAll,
    deselectAll,
    selectedBrandProduct,
    imageModalData.isOpen,
    isShortcutModalOpen,
    handleUndo,
    selectedProductIndex,
    expandedSelectedIndex,
    focusedPostIndex,
  ]);

  // ─────────────────────────────────────────────
  // 스크롤 & 자동 페이징
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (focusedPostIndex >= 0 && rightScrollRef.current) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const el = rightScrollRef.current?.querySelector(`[data-post-index="${focusedPostIndex}"]`);
        el?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }, 16);
    }
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [focusedPostIndex]);

  useEffect(() => {
    if (selectedProductIndex >= 0 && leftScrollRef.current && expandedBrandItemId === null) {
      if (leftScrollTimeoutRef.current) clearTimeout(leftScrollTimeoutRef.current);
      leftScrollTimeoutRef.current = setTimeout(() => {
        const el = leftScrollRef.current?.querySelector(
          `[data-product-index="${selectedProductIndex}"]`,
        );
        el?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }, 16);
    }
    return () => {
      if (leftScrollTimeoutRef.current) clearTimeout(leftScrollTimeoutRef.current);
    };
  }, [selectedProductIndex, expandedBrandItemId]);

  useEffect(() => {
    if (expandedBrandProductId !== null && expandedSelectedIndex >= 0 && leftScrollRef.current) {
      const el = leftScrollRef.current.querySelector(
        `[data-expanded-index="${expandedSelectedIndex}"]`,
      );
      el?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [expandedSelectedIndex, expandedBrandItemId, expandedBrandProductId]);

  // 자동 페이징: 좌측
  useEffect(() => {
    if (
      activeTab === 'brands' &&
      selectedProductIndex >= filteredBrandProducts.length - 3 &&
      hasBrandProductMore &&
      !isLoadingBrandProductMore
    ) {
      loadMoreBrandProducts();
    }
  }, [
    selectedProductIndex,
    filteredBrandProducts.length,
    hasBrandProductMore,
    isLoadingBrandProductMore,
    loadMoreBrandProducts,
    activeTab,
  ]);

  // 자동 페이징: 우측
  useEffect(() => {
    if (
      focusedPostIndex >= verificationItems.length - 3 &&
      hasVerificationMore &&
      !isLoadingVerificationMore
    ) {
      loadMoreVerifications();
    }
  }, [
    focusedPostIndex,
    verificationItems.length,
    hasVerificationMore,
    isLoadingVerificationMore,
    loadMoreVerifications,
  ]);

  // ─────────────────────────────────────────────
  // 로딩 화면
  // ─────────────────────────────────────────────

  if (brandProductLoading && allBrandProducts.length === 0) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-gray-500">브랜드 상품 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────

  return (
    <>
      <div className="flex h-[calc(100vh-200px)] overflow-hidden rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* ───── 좌측 패널: 브랜드 상품 목록 ───── */}
        <div
          ref={leftPanelRef}
          className={`flex w-80 flex-shrink-0 flex-col border-r transition-all ${
            isLeftPanelFocused
              ? 'border-primary/50 dark:border-primary/50'
              : 'border-stroke dark:border-strokedark'
          }`}
        >
          {/* 검색 */}
          <div className="border-b border-stroke p-3 dark:border-strokedark">
            <div className="relative">
              <input
                type="text"
                placeholder="브랜드/상품명 검색..."
                className="bg-gray-50 w-full rounded-lg border border-stroke py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <svg
                className="text-gray-400 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="text-gray-500 mt-1.5 flex items-center justify-between text-[10px]">
              <span>
                {isSearching ? (
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 animate-spin rounded-full border border-primary border-t-transparent" />
                    검색 중...
                  </span>
                ) : debouncedSearchQuery ? (
                  <>
                    검색결과{' '}
                    <span className="font-semibold text-primary">
                      {brandItemTotalCountData?.brandProductsByMatchCountTotalCount?.toLocaleString() ??
                        allBrandProducts.length}
                    </span>
                    개{hasBrandProductMore && ` · 로드됨 ${allBrandProducts.length}개`}
                  </>
                ) : (
                  <>
                    총{' '}
                    <span className="font-semibold text-primary">
                      {brandProductsTotalCountData?.brandProductsByMatchCountTotalCount?.toLocaleString() ??
                        '-'}
                    </span>
                    개 브랜드 상품
                    {hasBrandProductMore && ` · 로드됨 ${allBrandProducts.length}개`}
                  </>
                )}
              </span>
              <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[9px] font-semibold text-warning">
                전체 대기{' '}
                {pendingVerificationsTotalCountData?.pendingVerificationsTotalCount?.toLocaleString() ??
                  '-'}
                건
              </span>
            </div>
          </div>

          {/* 탭 */}
          <div className="border-b border-stroke px-3 py-2 dark:border-strokedark">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('brands')}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'brands'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:bg-meta-4 dark:hover:bg-meta-3'
                }`}
              >
                브랜드 상품
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:bg-meta-4 dark:hover:bg-meta-3'
                }`}
              >
                상세 상품 ({expandedItems.length > 0 ? expandedItems.length : '-'})
              </button>
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          {activeTab === 'brands' ? (
            <div ref={leftScrollRef} className="flex-1 overflow-y-auto">
              {filteredBrandProducts.length > 0 ? (
                <>
                  {filteredBrandProducts.map((bp, index) => (
                    <div key={bp.id} className="mb-0.5">
                      <button
                        data-product-index={index}
                        onClick={() => {
                          setSelectedBrandProduct(bp);
                          setSelectedProductIndex(index);
                          setIsLeftPanelFocused(true);
                          if (expandedBrandProductId !== bp.id) {
                            setExpandedBrandProductId(null);
                            setExpandedBrandItemId(null);
                            setExpandedItems([]);
                          }
                          if (
                            index >= filteredBrandProducts.length - 3 &&
                            hasBrandProductMore &&
                            !isLoadingBrandProductMore
                          ) {
                            loadMoreBrandProducts();
                          }
                        }}
                        className={`hover:bg-gray-50 flex w-full items-center gap-2 p-2 text-left transition-all dark:hover:bg-meta-4 ${
                          selectedBrandProduct?.id === bp.id && expandedBrandItemId === null
                            ? 'border-r-4 border-primary bg-primary/5'
                            : ''
                        } ${
                          isLeftPanelFocused &&
                          selectedProductIndex === index &&
                          expandedBrandItemId === null
                            ? 'ring-2 ring-inset ring-primary/50'
                            : ''
                        } ${expandedBrandProductId === bp.id ? 'bg-gray-100 dark:bg-meta-4' : ''}`}
                      >
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                            bp.pendingVerificationCount === 0 ? 'bg-success' : 'bg-warning'
                          }`}
                        >
                          {bp.pendingVerificationCount === 0 ? (
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            bp.pendingVerificationCount
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`line-clamp-2 text-xs font-semibold ${
                              selectedBrandProduct?.id === bp.id && expandedBrandItemId === null
                                ? 'text-primary'
                                : 'text-black dark:text-white'
                            }`}
                          >
                            {bp.brandName} {bp.productName}
                          </p>
                          <p className="text-gray-400 mt-0.5 text-[9px]">
                            {bp.volume && `${bp.volume}`}
                            {bp.volume && bp.amount && ' · '}
                            {bp.amount && `${bp.amount}`}
                          </p>
                        </div>
                      </button>
                    </div>
                  ))}
                  {isLoadingBrandProductMore && (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-gray-500 ml-2 text-xs">불러오는 중...</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center py-20">
                  <p>브랜드 상품이 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              {selectedBrandProduct && (
                <div className="mb-3">
                  <button
                    onClick={() => {
                      setActiveTab('brands');
                      setIsLeftPanelFocused(true);
                      setTimeout(() => {
                        const index = allBrandProducts.findIndex(
                          (bp) => bp.id === selectedBrandProduct?.id,
                        );
                        if (index >= 0) setSelectedProductIndex(index);
                      }, 0);
                    }}
                    className="hover:bg-gray-50 flex w-full items-center gap-2 rounded border border-stroke p-2 text-left transition-all dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      ←
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-primary">
                        {selectedBrandProduct.brandName} {selectedBrandProduct.productName}
                      </p>
                      <p className="text-gray-400 mt-0.5 text-[9px]">
                        {selectedBrandProduct.volume && `${selectedBrandProduct.volume}`}
                        {selectedBrandProduct.volume && selectedBrandProduct.amount && ' · '}
                        {selectedBrandProduct.amount && `${selectedBrandProduct.amount}`}
                      </p>
                    </div>
                  </button>
                </div>
              )}
              {expandedItems.length > 0 ? (
                expandedItems.map((expandedBp, expandedIndex) => (
                  <button
                    key={expandedBp.id}
                    data-expanded-index={expandedIndex}
                    onClick={() => {
                      setExpandedSelectedIndex(expandedIndex);
                      setSelectedBrandProduct(expandedBp);
                      setIsLeftPanelFocused(true);
                    }}
                    className={`hover:bg-gray-100 mb-1 flex w-full items-center gap-1.5 px-2 py-1.5 text-left transition-all dark:hover:bg-meta-4 ${
                      selectedBrandProduct?.id === expandedBp.id
                        ? 'border-r-3 border-primary bg-primary/10'
                        : ''
                    } ${
                      isLeftPanelFocused && expandedSelectedIndex === expandedIndex
                        ? 'ring-1 ring-inset ring-primary/50'
                        : ''
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                        expandedBp.pendingVerificationCount === 0
                          ? 'bg-success/80'
                          : 'bg-warning/80'
                      }`}
                    >
                      {expandedBp.pendingVerificationCount === 0 ? (
                        <svg
                          className="h-2.5 w-2.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        expandedBp.pendingVerificationCount
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`line-clamp-1 text-[10px] font-medium ${
                          selectedBrandProduct?.id === expandedBp.id
                            ? 'text-primary'
                            : 'text-black dark:text-white'
                        }`}
                      >
                        {expandedBp.volume || '-'} · {expandedBp.amount || '-'}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center py-10">
                  <p className="text-xs">스페이스바로 브랜드 상품을 선택하여</p>
                  <p className="text-xs">상세 상품 목록을 확인하세요.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ───── 우측 패널: 검증 항목 ───── */}
        <div className="bg-gray-50 flex flex-1 flex-col overflow-hidden dark:bg-black">
          {selectedBrandProduct ? (
            <>
              {/* 헤더 */}
              <div className="flex items-center justify-between border-b border-stroke bg-white px-3 py-2 dark:border-strokedark dark:bg-boxdark">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-black dark:text-white">
                    {selectedBrandProduct.brandName} {selectedBrandProduct.productName}
                    {(selectedBrandProduct.volume || selectedBrandProduct.amount) && (
                      <span className="text-gray-400 ml-2 text-xs font-normal">
                        {selectedBrandProduct.volume}
                        {selectedBrandProduct.volume && selectedBrandProduct.amount && ' · '}
                        {selectedBrandProduct.amount}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* #7: Undo 버튼 */}
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                      canUndo
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:bg-meta-4'
                        : 'bg-gray-50 text-gray-300 dark:text-gray-600 cursor-not-allowed dark:bg-meta-4/50'
                    }`}
                    title="Ctrl+Z"
                  >
                    {isUndoing ? (
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        취소 중
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4"
                          />
                        </svg>
                        되돌리기
                      </span>
                    )}
                  </button>
                  <div className="bg-gray-200 mx-0.5 h-4 w-px dark:bg-strokedark" />
                  <button
                    onClick={selectAll}
                    className="rounded bg-success/10 px-2 py-1 text-[11px] font-medium text-success transition-colors hover:bg-success/20"
                    title="Shift+A"
                  >
                    전체승인
                  </button>
                  <button
                    onClick={deselectAll}
                    className="bg-gray-100 text-gray-500 hover:bg-gray-200 dark:text-gray-400 rounded px-2 py-1 text-[11px] font-medium transition-colors dark:bg-meta-4"
                    title="N"
                  >
                    전체거절
                  </button>
                  <div className="bg-gray-200 mx-0.5 h-4 w-px dark:bg-strokedark" />
                  <button
                    onClick={handleConfirmMatching}
                    className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-opacity-90"
                    title="Enter"
                  >
                    확정
                  </button>
                  <button
                    onClick={handleConfirmAndNext}
                    className="flex items-center gap-0.5 rounded bg-primary/80 px-2 py-1 text-[11px] font-bold text-white transition-colors hover:bg-primary"
                    title="Ctrl+Enter"
                  >
                    확정+다음
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 통계 + 필터 */}
              <div className="flex items-center justify-between border-b border-stroke bg-white px-3 py-1 dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-gray-500 dark:text-gray-400">
                    전체{' '}
                    <span className="font-bold text-black dark:text-white">
                      {pendingVerificationsTotalCountByBrandProductData?.pendingVerificationsTotalCount ??
                        stats.total}
                    </span>
                  </span>
                  <span className="text-success">
                    승인 <span className="font-bold">{stats.selected}</span>
                  </span>
                  <span className="text-danger">
                    거절 <span className="font-bold">{stats.deselected}</span>
                  </span>
                </div>
                <label className="text-gray-500 dark:text-gray-400 flex cursor-pointer items-center gap-1.5 text-[11px]">
                  <input
                    type="checkbox"
                    checked={!includeVerified}
                    onChange={(e) => setIncludeVerified(!e.target.checked)}
                    className="border-gray-300 h-3.5 w-3.5 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span
                    className={
                      !includeVerified ? 'font-medium text-blue-600 dark:text-blue-400' : ''
                    }
                  >
                    대기만
                  </span>
                </label>
              </div>

              {/* 검증 항목 목록 */}
              <div ref={rightScrollRef} className="flex-1 overflow-y-auto p-2">
                <div ref={rightPanelRef} />
                {pendingLoading && verificationItems.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-gray-500 ml-2">검증 대기 목록 불러오는 중...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {verificationItems.length > 0 ? (
                      <>
                        {verificationItems.map((item, index) => (
                          <VerificationItem
                            key={item.id}
                            item={item}
                            isSelected={itemSelections[item.id] ?? true}
                            index={index}
                            isFocused={focusedPostIndex === index && !isLeftPanelFocused}
                            brandName={selectedBrandProduct.brandName}
                            productName={selectedBrandProduct.productName}
                            volume={selectedBrandProduct.volume}
                            amount={selectedBrandProduct.amount}
                            onItemClick={handleItemClick}
                            onToggleSelection={toggleItemSelection}
                            onImageClick={handleImageClick}
                          />
                        ))}
                        {isLoadingVerificationMore && (
                          <div className="flex items-center justify-center py-4">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span className="text-gray-500 ml-2 text-xs">불러오는 중...</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stroke bg-white py-16 dark:border-strokedark dark:bg-boxdark">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                          <svg
                            className="h-6 w-6 text-success"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">매칭 항목이 없습니다</p>
                        <p className="text-gray-400 mt-1 text-xs">
                          {!includeVerified
                            ? '검증 완료된 항목은 필터에서 숨겨져 있습니다'
                            : '이 상품에 매칭된 게시물이 없습니다'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-gray-500 flex flex-1 items-center justify-center">
              {filteredBrandProducts.length > 0
                ? '좌측에서 브랜드 상품을 선택해주세요.'
                : '브랜드 상품이 없습니다.'}
            </div>
          )}
        </div>
      </div>

      {/* ───── 모달 ───── */}
      <ImageCompareModal
        isOpen={imageModalData.isOpen}
        onClose={() => setImageModalData((prev) => ({ ...prev, isOpen: false }))}
        danawaImage={imageModalData.danawaImage}
        danawaTitle={imageModalData.danawaTitle}
        danawaUrl={imageModalData.danawaUrl}
        communityImage={imageModalData.communityImage}
        communityTitle={imageModalData.communityTitle}
      />

      {/* #4: 단축키 도움말 모달 */}
      <KeyboardShortcutModal
        isOpen={isShortcutModalOpen}
        onClose={() => setIsShortcutModalOpen(false)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </>
  );
};

export default VerificationGroupByView;
