'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

import ImageCompareModal from './ImageCompareModal';
import Toast from './Toast';

const PAGE_LIMIT = 20;

// 검증 대기 항목 타입
interface PendingVerificationItem {
  id: string;
  productId: number;
  brandProduct: string | null;
  product: {
    title: string;
    thumbnail?: string | null;
  } | null;
  danawaUrl: string | null;
  createdAt: string;
  searchAfter: string[] | null;
  isSelected: boolean;
  // 검증 상태 관련 필드 추가
  verificationStatus: string | null;
  verifiedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  verifiedAt: string | null;
}

// 메모이제이션된 검증 아이템 컴포넌트
interface VerificationItemProps {
  item: PendingVerificationItem;
  isSelected: boolean;
  index: number;
  isFocused: boolean;
  onItemClick: (index: number) => void;
  onToggleSelection: (id: string) => void;
  onImageClick: (thumbnail: string, title: string) => void;
}

const VerificationItem = memo(function VerificationItem({
  item,
  isSelected,
  index,
  isFocused,
  onItemClick,
  onToggleSelection,
  onImageClick,
}: VerificationItemProps) {
  const verifierName = item.verifiedBy?.name;

  // 검증 상태에 따른 스타일 결정
  const getBorderClass = () => {
    if (isFocused) return 'border-primary ring-2 ring-primary/20';
    if (item.verificationStatus === 'VERIFIED')
      return 'border-success/50 bg-success/5 dark:bg-success/10';
    if (item.verificationStatus === 'REJECTED')
      return 'border-danger/50 bg-danger/5 dark:bg-danger/10';
    if (isSelected) return 'border-success/30';
    return 'border-danger/30';
  };

  const getStatusBadge = () => {
    if (item.verificationStatus === 'VERIFIED') {
      return (
        <span className="rounded bg-success/10 px-1 py-0.5 text-[10px] font-bold text-success">
          승인완료
        </span>
      );
    }
    if (item.verificationStatus === 'REJECTED') {
      return (
        <span className="rounded bg-danger/10 px-1 py-0.5 text-[10px] font-bold text-danger">
          거절완료
        </span>
      );
    }
    return (
      <span
        className={`rounded px-1 py-0.5 text-[10px] font-bold ${
          isSelected ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}
      >
        {isSelected ? '승인 대기' : '거절 대기'}
      </span>
    );
  };

  return (
    <div
      data-post-index={index}
      onClick={() => onItemClick(index)}
      className={`group relative cursor-pointer rounded-xl border-2 bg-white p-1.5 shadow-sm transition-all dark:bg-boxdark ${getBorderClass()}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox - 항상 활성화하여 수정 가능하도록 함 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(item.id);
          }}
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
            isSelected
              ? 'border-success bg-success text-white'
              : 'border-danger bg-danger/10 text-danger'
          }`}
        >
          {isSelected ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>

        {/* Image Thumbnail */}
        {item.product?.thumbnail && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(item.product?.thumbnail || '', item.product?.title || '');
            }}
            className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-stroke bg-white hover:scale-105 dark:border-strokedark"
          >
            <img
              src={item.product.thumbnail}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No';
              }}
            />
          </button>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Status Badge, ID, Date, Verifier */}
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            {getStatusBadge()}
            <span className="text-gray-400 text-[10px]">ID: {item.productId}</span>
            <span className="text-gray-400 text-[10px]">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
            {/* 검증자 표시 (모킹) */}
            {item.verificationStatus === 'VERIFIED' && verifierName && (
              <span className="rounded bg-blue-50 px-1 py-0.5 text-[10px] text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                검증: {verifierName}
              </span>
            )}
          </div>

          {/* Title and Danawa Link */}
          <div className="flex items-center gap-1">
            <p className="line-clamp-1 flex-1 text-xs font-semibold text-black dark:text-white">
              {item.product?.title || '제목 없음'}
            </p>
            {item.danawaUrl && (
              <a
                href={item.danawaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap text-[10px] text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                다나와
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const VerificationGroupByView = () => {
  // 왼쪽: 브랜드 상품 목록 상태
  const [allBrandProducts, setAllBrandProducts] = useState<BrandProduct[]>([]);
  const [brandProductSearchAfter, setBrandProductSearchAfter] = useState<string[] | null>(null);
  const [hasBrandProductMore, setHasBrandProductMore] = useState(true);
  const [isLoadingBrandProductMore, setIsLoadingBrandProductMore] = useState(false);

  // 오른쪽: 검증 대기 목록 상태
  const [verificationItems, setVerificationItems] = useState<PendingVerificationItem[]>([]);
  const [verificationSearchAfter, setVerificationSearchAfter] = useState<string[] | null>(null);
  const [hasVerificationMore, setHasVerificationMore] = useState(true);
  const [isLoadingVerificationMore, setIsLoadingVerificationMore] = useState(false);

  // 선택된 브랜드 상품
  const [selectedBrandProduct, setSelectedBrandProduct] = useState<BrandProduct | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  // Expand 상태 (brandProductId로 특정 항목만 확장)
  const [expandedBrandProductId, setExpandedBrandProductId] = useState<string | null>(null);
  const [expandedBrandItemId, setExpandedBrandItemId] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<BrandProduct[]>([]);
  const [isLoadingExpanded, setIsLoadingExpanded] = useState(false);
  const [expandedSelectedIndex, setExpandedSelectedIndex] = useState(0);

  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [itemSelections, setItemSelections] = useState<Record<string, boolean>>({});
  const [focusedPostIndex, setFocusedPostIndex] = useState<number>(-1);
  const [isLeftPanelFocused, setIsLeftPanelFocused] = useState(true);

  // 탭 상태
  const [activeTab, setActiveTab] = useState<'brands' | 'details'>('brands');

  // 검증된 상품 포함 여부
  const [includeVerified, setIncludeVerified] = useState(false);

  // 탭 변경 시 좌측 패널 포커스 유지 및 선택 상태 복원
  useEffect(() => {
    // 탭이 변경될 때만 좌측 패널로 포커스 이동
    setIsLeftPanelFocused(true);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'brands') {
      // 선택된 브랜드 상품이 있으면 인덱스 복원
      if (selectedBrandProduct) {
        const index = allBrandProducts.findIndex((bp) => bp.id === selectedBrandProduct.id);
        if (index >= 0) {
          setSelectedProductIndex(index);
        }
      }
    }
  }, [selectedBrandProduct, allBrandProducts, activeTab]);

  // 검색어 쓰로틀 (300ms)
  const searchThrottleRef = useRef<NodeJS.Timeout | null>(null);

  // API Hooks
  const { data: brandProductData, loading: brandProductLoading } =
    useGetBrandProductsOrderByMatchCount({
      limit: PAGE_LIMIT,
    });
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

  // 브랜드 상품 초기 데이터 로드
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

  // 첫 번째 브랜드 상품 자동 선택
  useEffect(() => {
    if (allBrandProducts.length > 0 && !selectedBrandProduct) {
      setSelectedBrandProduct(allBrandProducts[0]);
    }
  }, [allBrandProducts, selectedBrandProduct]);

  // 선택된 브랜드 상품이 바뀌거나 includeVerified 상태가 바뀌면 검증 목록 로드 및 전체 개수 조회
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
  }, [selectedBrandProduct, includeVerified, fetchPendingVerificationsTotalCountByBrandProduct]);

  // 특정 브랜드 상품의 검증 대기 목록 로드
  const loadVerificationsForBrandProduct = useCallback(
    async (brandProductId: number) => {
      setVerificationItems([]);
      setVerificationSearchAfter(null);
      setHasVerificationMore(true);
      setItemSelections({});

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
          const items = result.data.pendingVerifications.map((item) => ({
            id: item.id,
            productId: item.productId,
            brandProduct: item.brandProduct ?? null,
            product: item.product ?? null,
            danawaUrl: item.danawaUrl ?? null,
            createdAt: item.createdAt,
            searchAfter: item.searchAfter ?? null,
            isSelected: item.verificationStatus !== 'VERIFIED',
            verificationStatus: item.verificationStatus ?? null,
            verifiedBy: item.verifiedBy
              ? {
                  id: item.verifiedBy.id,
                  name: item.verifiedBy.name,
                  email: item.verifiedBy.email,
                }
              : null,
            verifiedAt: item.verifiedAt ?? null,
          }));
          setVerificationItems(items);

          // 초기 선택 상태 설정: VERIFIED면 true, REJECTED면 false, 나머지는 true(승인대기)
          const initialSelections: Record<string, boolean> = {};
          items.forEach((item) => {
            if (item.verificationStatus === 'VERIFIED') {
              initialSelections[item.id] = true;
            } else if (item.verificationStatus === 'REJECTED') {
              initialSelections[item.id] = false;
            } else {
              initialSelections[item.id] = true;
            }
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
    [fetchPendingVerifications, includeVerified],
  );

  // 선택된 브랜드 상품이 바뀌거나 includeVerified 상태가 바뀌면 검증 목록 로드 및 전체 개수 조회
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

  // 브랜드 상품 더 불러오기
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

  // brandItemId로 하위 항목 로드 (expand)
  const loadExpandedItems = useCallback(
    async (brandItemId: number) => {
      setIsLoadingExpanded(true);
      try {
        const result = await fetchMoreBrandProducts({
          variables: {
            limit: 50,
            brandItemId,
          },
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

  // Expand/Collapse 토글
  const toggleExpand = useCallback(
    (brandProduct: BrandProduct) => {
      if (expandedBrandProductId === brandProduct.id) {
        // 이미 확장된 경우 닫기
        setExpandedBrandProductId(null);
        setExpandedBrandItemId(null);
        setExpandedItems([]);
        setExpandedSelectedIndex(0);
      } else {
        // 새로 확장
        setExpandedBrandProductId(brandProduct.id);
        setExpandedBrandItemId(brandProduct.brandItemId);
        loadExpandedItems(brandProduct.brandItemId);
        // 해당 brandItemId의 전체 개수 조회
        fetchBrandItemTotalCount({ variables: { brandItemId: brandProduct.brandItemId } });

        // 상세 상품 탭으로 자동 전환
        setActiveTab('details');
      }
    },
    [expandedBrandProductId, loadExpandedItems, fetchBrandItemTotalCount],
  );

  // 검증 대기 목록 더 불러오기
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
        const newItems = result.data.pendingVerifications.map((item) => ({
          id: item.id,
          productId: item.productId,
          brandProduct: item.brandProduct ?? null,
          product: item.product ?? null,
          danawaUrl: item.danawaUrl ?? null,
          createdAt: item.createdAt,
          searchAfter: item.searchAfter ?? null,
          isSelected: item.verificationStatus !== 'VERIFIED',
          verificationStatus: item.verificationStatus ?? null,
          verifiedBy: item.verifiedBy
            ? {
                id: item.verifiedBy.id,
                name: item.verifiedBy.name,
                email: item.verifiedBy.email,
              }
            : null,
          verifiedAt: item.verifiedAt ?? null,
        }));

        if (newItems.length > 0) {
          setVerificationItems((prev) => [...prev, ...newItems]);

          // 새 항목들 선택 상태 추가
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
  ]);

  // 검색 핸들러
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);

    if (searchThrottleRef.current) {
      clearTimeout(searchThrottleRef.current);
    }

    searchThrottleRef.current = setTimeout(() => {
      setDebouncedSearchQuery(value);
    }, 300);
  }, []);

  // 검색어 변경 시 API 호출
  useEffect(() => {
    const searchBrandProducts = async () => {
      setIsSearching(true);
      setSelectedBrandProduct(null);
      setSelectedProductIndex(0);
      setBrandProductSearchAfter(null);
      setHasBrandProductMore(true);

      // 확장 상태 초기화
      setExpandedBrandProductId(null);
      setExpandedBrandItemId(null);
      setExpandedItems([]);

      try {
        const result = await fetchMoreBrandProducts({
          variables: {
            limit: PAGE_LIMIT,
            title: debouncedSearchQuery || undefined,
          },
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

        // 전체 개수도 검색어 포함해서 조회
        fetchBrandItemTotalCount({
          variables: {
            title: debouncedSearchQuery || undefined,
          },
        });
      } catch (error) {
        console.error('Failed to search brand products:', error);
      } finally {
        setIsSearching(false);
      }
    };

    // 초기 로딩이 완료된 후에만 검색 실행
    if (brandProductData) {
      searchBrandProducts();
    }
  }, [debouncedSearchQuery, fetchMoreBrandProducts, fetchBrandItemTotalCount, brandProductData]);

  // Modal states
  const [imageModalData, setImageModalData] = useState<{
    isOpen: boolean;
    danawaImage: string;
    danawaTitle: string;
    communityImage?: string;
    communityTitle: string;
  }>({ isOpen: false, danawaImage: '', danawaTitle: '', communityTitle: '' });

  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'success',
  });

  // Refs
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // Filtered products (서버에서 이미 필터링되어 옴)
  const filteredBrandProducts = allBrandProducts;

  // 현재 항목들 (선택 상태 반영, 모든 항목 표시)
  const currentItems = useMemo(() => {
    return verificationItems.map((item) => ({
      ...item,
      isSelected: itemSelections[item.id] ?? true,
    }));
  }, [verificationItems, itemSelections]);

  const selectedItems = currentItems.filter((item) => item.isSelected);
  const deselectedItems = currentItems.filter((item) => !item.isSelected);

  // Toggle item selection
  const toggleItemSelection = useCallback((itemId: string) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  // Select all
  const selectAll = useCallback(() => {
    const newSelections: Record<string, boolean> = { ...itemSelections };
    verificationItems.forEach((item) => {
      newSelections[item.id] = true;
    });
    setItemSelections(newSelections);
  }, [verificationItems, itemSelections]);

  // Deselect all
  const deselectAll = useCallback(() => {
    const newSelections: Record<string, boolean> = { ...itemSelections };
    verificationItems.forEach((item) => {
      newSelections[item.id] = false;
    });
    setItemSelections(newSelections);
  }, [verificationItems, itemSelections]);

  // Show toast helper
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ isVisible: true, message, type });
    },
    [],
  );

  // Handle confirm matching
  const handleConfirmMatching = useCallback(async () => {
    const itemsToApprove = selectedItems.filter((item) => item.verificationStatus !== 'VERIFIED');
    const itemsToReject = deselectedItems.filter((item) => item.verificationStatus !== 'REJECTED');

    const totalCount = itemsToApprove.length + itemsToReject.length;

    if (totalCount === 0) {
      showToast('변경 사항이 없습니다.', 'info');
      return;
    }

    try {
      // 승인된 항목 처리
      if (itemsToApprove.length > 0) {
        await batchVerifyMutation({
          variables: {
            productMappingIds: itemsToApprove.map((item) => parseInt(item.id)),
            result: ProductMappingVerificationStatus.Verified,
          },
        });
      }

      // 거절된 항목 처리
      if (itemsToReject.length > 0) {
        await batchVerifyMutation({
          variables: {
            productMappingIds: itemsToReject.map((item) => parseInt(item.id)),
            result: ProductMappingVerificationStatus.Rejected,
          },
        });
      }

      // 로컬 상태 업데이트
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

      // Show success toast
      showToast(
        `저장 완료! ✓ ${itemsToApprove.length}건 승인${itemsToReject.length > 0 ? ` · ✗ ${itemsToReject.length}건 제외` : ''}`,
        'success',
      );

      // 브랜드 상품 목록에서 pendingVerificationCount 업데이트
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
      // 자동 이동 로직 제거 (수정 가능한 구조를 위해 현재 페이지 유지)
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
  ]);

  // Handlers for VerificationItem
  const handleItemClick = useCallback(
    (idx: number) => {
      setFocusedPostIndex(idx);
      setIsLeftPanelFocused(false);
      // 마지막 항목 근처 클릭 시 추가 로딩
      if (idx >= currentItems.length - 3 && hasVerificationMore && !isLoadingVerificationMore) {
        loadMoreVerifications();
      }
    },
    [currentItems.length, hasVerificationMore, isLoadingVerificationMore, loadMoreVerifications],
  );

  const handleImageClick = useCallback(
    (thumbnail: string, title: string) => {
      if (!selectedBrandProduct) return;
      setImageModalData({
        isOpen: true,
        danawaImage: '',
        danawaTitle: `${selectedBrandProduct.brandName} ${selectedBrandProduct.productName}`,
        communityImage: thumbnail || undefined,
        communityTitle: title,
      });
    },
    [selectedBrandProduct],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (imageModalData.isOpen) return;

      const isInSearchInput = document.activeElement?.tagName === 'INPUT';
      const isInTextarea = document.activeElement?.tagName === 'TEXTAREA';

      // 검색창에서 ArrowDown 누르면 브랜드 상품 목록으로 이동
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
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
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
            // 우측 패널에서 왼쪽 키: 좌측 패널로 이동
            setIsLeftPanelFocused(true);
            setFocusedPostIndex(-1);
          } else if (activeTab === 'details') {
            // 좌측 패널(상세 탭)에서 왼쪽 키: 브랜드 탭으로 이동 (확장 닫기)
            // 스페이스바와 동일한 로직
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
              // 브랜드 상품 탭에서 스페이스: expand/collapse
              toggleExpand(currentProduct);
            } else if (activeTab === 'details') {
              // 상세 상품 탭에서 스페이스: 브랜드 상품 탭으로 돌아가기
              setActiveTab('brands');
              setIsLeftPanelFocused(true);
              setFocusedPostIndex(-1); // 우측 포커스 초기화

              // 확장 상태 초기화
              setExpandedBrandProductId(null);
              setExpandedBrandItemId(null);
              setExpandedItems([]);
              setExpandedSelectedIndex(0);
            }
          } else if (!isLeftPanelFocused) {
            const currentItem = verificationItems[focusedPostIndex];
            if (currentItem) {
              toggleItemSelection(currentItem.id);
            }
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd + Enter: Move to next
            if (activeTab === 'details') {
              setExpandedSelectedIndex((prev) => {
                const next = prev + 1;
                if (next < expandedItems.length) {
                  setSelectedBrandProduct(expandedItems[next]);
                  return next;
                } else {
                  setActiveTab('brands');
                  return prev;
                }
              });
            } else {
              setSelectedProductIndex((prev) => {
                const next = Math.min(prev + 1, filteredBrandProducts.length - 1);
                setSelectedBrandProduct(filteredBrandProducts[next]);
                return next;
              });
            }
            setFocusedPostIndex(-1);
            setIsLeftPanelFocused(true);
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
              communityImage: item.product?.thumbnail || undefined,
              communityTitle: item.product?.title || '',
            });
          }
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
    toggleExpand,
    toggleItemSelection,
    selectAll,
    deselectAll,
    selectedBrandProduct,
    imageModalData.isOpen,
  ]);

  // Scroll focused post into view (debounced for performance)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (focusedPostIndex >= 0 && rightScrollRef.current) {
      // Cancel previous scroll animation
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const focusedElement = rightScrollRef.current?.querySelector(
          `[data-post-index="${focusedPostIndex}"]`,
        );
        focusedElement?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }, 16); // ~1 frame delay
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [focusedPostIndex]);

  // Scroll selected brand product into view
  const leftScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedProductIndex >= 0 && leftScrollRef.current && expandedBrandItemId === null) {
      if (leftScrollTimeoutRef.current) {
        clearTimeout(leftScrollTimeoutRef.current);
      }

      leftScrollTimeoutRef.current = setTimeout(() => {
        const selectedElement = leftScrollRef.current?.querySelector(
          `[data-product-index="${selectedProductIndex}"]`,
        );
        selectedElement?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }, 16);
    }

    return () => {
      if (leftScrollTimeoutRef.current) {
        clearTimeout(leftScrollTimeoutRef.current);
      }
    };
  }, [selectedProductIndex, expandedBrandItemId]);

  // Scroll expanded item into view
  useEffect(() => {
    if (expandedBrandProductId !== null && expandedSelectedIndex >= 0 && leftScrollRef.current) {
      const expandedElement = leftScrollRef.current.querySelector(
        `[data-expanded-index="${expandedSelectedIndex}"]`,
      );
      expandedElement?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [expandedSelectedIndex, expandedBrandItemId, expandedBrandProductId]);

  // 자동 페이징: 좌측 브랜드 목록
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

  // 자동 페이징: 우측 검증 목록
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

  // Statistics
  const stats = {
    total: currentItems.length,
    selected: selectedItems.length,
    deselected: deselectedItems.length,
  };

  // Loading state
  if (brandProductLoading && allBrandProducts.length === 0) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-500">브랜드 상품 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-200px)] overflow-hidden rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Left Sidebar - Brand Product List */}
        <div
          ref={leftPanelRef}
          className={`flex w-80 flex-shrink-0 flex-col border-r transition-all ${
            isLeftPanelFocused
              ? 'border-primary/50 dark:border-primary/50'
              : 'border-stroke dark:border-strokedark'
          }`}
        >
          {/* Search */}
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
                    <span className="h-2.5 w-2.5 animate-spin rounded-full border border-primary border-t-transparent"></span>
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

          {/* Tabs */}
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

          {/* Tab Content */}
          {activeTab === 'brands' ? (
            <div ref={leftScrollRef} className="flex-1 overflow-y-auto">
              {/* Brand Product List */}
              {filteredBrandProducts.length > 0 ? (
                <>
                  {filteredBrandProducts.map((bp, index) => (
                    <div key={bp.id} className="mb-0.5">
                      {/* 메인 항목 */}
                      <button
                        data-product-index={index}
                        onClick={() => {
                          setSelectedBrandProduct(bp);
                          setSelectedProductIndex(index);
                          setIsLeftPanelFocused(true);
                          // 확장 상태 초기화
                          if (expandedBrandProductId !== bp.id) {
                            setExpandedBrandProductId(null);
                            setExpandedBrandItemId(null);
                            setExpandedItems([]);
                          }
                          // 마지막 항목 근처 클릭 시 추가 로딩
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
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-white">
                          {bp.pendingVerificationCount}
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
                  {/* Loading indicator */}
                  {isLoadingBrandProductMore && (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
              {/* Header with selected brand product */}
              {selectedBrandProduct && (
                <div className="mb-3">
                  <button
                    onClick={() => {
                      setActiveTab('brands');
                      setIsLeftPanelFocused(true);
                      // 선택 상태 복원
                      setTimeout(() => {
                        if (
                          selectedBrandProduct &&
                          allBrandProducts[selectedProductIndex]?.id === selectedBrandProduct.id
                        ) {
                          // 선택 상태가 일치하면 그대로 유지
                        } else {
                          // 선택 상태 복원
                          const index = allBrandProducts.findIndex(
                            (bp) => bp.id === selectedBrandProduct?.id,
                          );
                          if (index >= 0) {
                            setSelectedProductIndex(index);
                          }
                        }
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

              {/* Details Product List */}
              {expandedItems.length > 0 ? (
                <>
                  {expandedItems.map((expandedBp, expandedIndex) => (
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
                      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-warning/80 text-[9px] font-bold text-white">
                        {expandedBp.pendingVerificationCount}
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
                  ))}
                </>
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center py-10">
                  <p className="text-xs">스페이스바로 브랜드 상품을 선택하여</p>
                  <p className="text-xs">상세 상품 목록을 확인하세요.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="bg-gray-50 flex flex-1 flex-col overflow-hidden dark:bg-black">
          {selectedBrandProduct ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stroke bg-white p-1.5 dark:border-strokedark dark:bg-boxdark">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {selectedBrandProduct.brandName} {selectedBrandProduct.productName}
                  </h3>
                  <p className="text-gray-500 mt-0.5 text-xs">
                    {selectedBrandProduct.volume && `${selectedBrandProduct.volume}`}
                    {selectedBrandProduct.volume && selectedBrandProduct.amount && ' · '}
                    {selectedBrandProduct.amount && `${selectedBrandProduct.amount}`}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-1 rounded bg-success/10 px-2 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20"
                    title="Shift+A"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    전체선택
                  </button>
                  <button
                    onClick={deselectAll}
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-1 rounded px-2 py-1.5 text-xs font-medium transition-colors dark:bg-meta-4"
                    title="N"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    해제
                  </button>
                  <button
                    onClick={handleConfirmMatching}
                    className="flex items-center gap-1 rounded bg-primary px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-opacity-90"
                    title="Enter"
                  >
                    <svg
                      className="h-3.5 w-3.5"
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
                    확정
                  </button>
                  <button
                    onClick={() => {
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
                    }}
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-bold transition-colors dark:bg-meta-4"
                    title="Ctrl + Enter"
                  >
                    다음
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Include Verified Checkbox */}
              <div className="flex items-center justify-end border-b border-stroke bg-white px-3 py-1.5 dark:border-strokedark dark:bg-boxdark">
                <label className="text-gray-600 dark:text-gray-400 flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={includeVerified}
                    onChange={(e) => setIncludeVerified(e.target.checked)}
                    className="border-gray-300 h-4 w-4 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span
                    className={
                      includeVerified ? 'font-medium text-blue-600 dark:text-blue-400' : ''
                    }
                  >
                    검증된 상품 포함
                  </span>
                  {includeVerified && (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                      모든 상태 표시
                    </span>
                  )}
                </label>
              </div>

              {/* Stats Panel */}
              <div className="grid grid-cols-3 gap-1 border-b border-stroke bg-white px-1.5 py-0.5 dark:border-strokedark dark:bg-boxdark">
                <div className="bg-gray-50 rounded p-1 dark:bg-meta-4">
                  <p className="text-gray-500 dark:text-gray-400 text-[9px]">전체</p>
                  <p className="text-sm font-bold text-black dark:text-white">
                    {pendingVerificationsTotalCountByBrandProductData?.pendingVerificationsTotalCount ??
                      stats.total}
                  </p>
                </div>
                <div className="rounded bg-success/10 p-1">
                  <p className="text-[9px] text-success">승인</p>
                  <p className="text-sm font-bold text-success">{stats.selected}</p>
                </div>
                <div className="rounded bg-danger/10 p-1">
                  <p className="text-[9px] text-danger">거절</p>
                  <p className="text-sm font-bold text-danger">{stats.deselected}</p>
                </div>
              </div>

              {/* Items List */}
              <div ref={rightScrollRef} className="flex-1 overflow-y-auto p-2">
                <div ref={rightPanelRef} className="mb-1 flex items-center justify-between">
                  <span className="text-gray-500 text-sm font-medium">
                    매칭된 커뮤니티 게시물 ({currentItems.length})
                    {hasVerificationMore && ' · ↓ 더 불러오기'}
                  </span>
                  <div className="text-gray-400 flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <kbd className="font-mono rounded bg-white px-1.5 py-0.5 text-[10px] dark:bg-boxdark">
                        Space
                      </kbd>
                      선택/해제
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="font-mono rounded bg-white px-1.5 py-0.5 text-[10px] dark:bg-boxdark">
                        Enter
                      </kbd>
                      확정
                    </span>
                  </div>
                </div>

                {pendingLoading && verificationItems.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
                            onItemClick={handleItemClick}
                            onToggleSelection={toggleItemSelection}
                            onImageClick={handleImageClick}
                          />
                        ))}
                        {/* Loading indicator */}
                        {isLoadingVerificationMore && (
                          <div className="flex items-center justify-center py-4">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <span className="text-gray-500 ml-2 text-xs">불러오는 중...</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stroke bg-white py-20 dark:border-strokedark dark:bg-boxdark">
                        <svg
                          className="text-gray-300 mb-4 h-16 w-16"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-gray-500">검증 대기 항목이 없습니다.</p>
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

      {/* Modals */}
      <ImageCompareModal
        isOpen={imageModalData.isOpen}
        onClose={() => setImageModalData({ ...imageModalData, isOpen: false })}
        danawaImage={imageModalData.danawaImage}
        danawaTitle={imageModalData.danawaTitle}
        communityImage={imageModalData.communityImage}
        communityTitle={imageModalData.communityTitle}
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
