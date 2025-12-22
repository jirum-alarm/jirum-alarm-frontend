'use client';

import Link from 'next/link';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  useBatchVerifyProductMapping,
  useCancelVerification,
  useGetPendingVerifications,
  useRemoveProductMapping,
  useVerifyProductMapping,
} from '@/hooks/graphql/verification';
import {
  PendingVerification,
  ProductMappingVerificationStatus,
  VerificationResult,
  VerificationStatus,
} from '@/types/verification';
import { dateFormatter } from '@/utils/date';
import { getJaccardSimilarity } from '@/utils/text';

const VerificationStatusMap: Record<VerificationStatus, string> = {
  [VerificationStatus.PendingVerification]: '대기',
  [VerificationStatus.Verified]: '승인',
  [VerificationStatus.Rejected]: '거부',
};

const VerificationStatusColorMap: Record<VerificationStatus, string> = {
  [VerificationStatus.PendingVerification]: 'bg-warning text-warning bg-opacity-10',
  [VerificationStatus.Verified]: 'bg-success text-success bg-opacity-10',
  [VerificationStatus.Rejected]: 'bg-danger text-danger bg-opacity-10',
};

type ToastType = 'success' | 'error';

const VerificationTable = () => {
  const [prioritizeOld, setPrioritizeOld] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allItems, setAllItems] = useState<PendingVerification[]>([]);
  const [searchAfter, setSearchAfter] = useState<string[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [statusFilter, setStatusFilter] = useState<ProductMappingVerificationStatus | 'ALL'>(
    ProductMappingVerificationStatus.PendingVerification,
  );
  const [processedInSessionIds, setProcessedInSessionIds] = useState<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const tableRef = useRef<HTMLTableSectionElement>(null);

  const {
    data,
    refetch,
    fetchMore,
    loading: queryLoading,
    error,
  } = useGetPendingVerifications(
    {
      prioritizeOld,
      searchAfter: null, // 첫 로드만 null
    },
    {
      notifyOnNetworkStatusChange: true,
    },
  );
  const [verifyProductMapping, { loading }] = useVerifyProductMapping();
  const [batchVerifyProductMapping, { loading: batchLoading }] = useBatchVerifyProductMapping();
  const [removeProductMapping, { loading: removeLoading }] = useRemoveProductMapping();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: number | null;
    productTitle: string | null;
  }>({
    isOpen: false,
    productId: null,
    productTitle: null,
  });
  const [cancelVerification, { loading: cancelLoading }] = useCancelVerification();

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isOpen: boolean;
  }>({
    message: '',
    type: 'success',
    isOpen: false,
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isOpen: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isOpen: false }));
    }, 3000);
  };

  const moveToNext = () => {
    setFocusedIndex((prev) => {
      if (prev < filteredItems.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

  const flushProcessed = useCallback(() => {
    setAllItems((prev) => {
      // 현재 allItems에서 이미 처리된(processedInSessionIds에 있는) 항목들을 제거
      return prev.filter((item) => {
        const isProcessed =
          item.verificationStatus !== ProductMappingVerificationStatus.PendingVerification;
        return (
          !isProcessed || statusFilter !== ProductMappingVerificationStatus.PendingVerification
        );
      });
    });
    setProcessedInSessionIds(new Set());
    setFocusedIndex(0);
  }, [statusFilter]);

  const handleVerify = async (productMappingId: number | string) => {
    const numericId = Number(productMappingId);
    const currentItem = allItems.find((item) => Number(item.id) === numericId);

    // 이미 승인된 경우 취소 처리 (토글)
    if (currentItem?.verificationStatus === ProductMappingVerificationStatus.Verified) {
      return handleCancelVerification(productMappingId, VerificationStatus.Verified);
    }

    // 즉시 UI 업데이트
    setAllItems((prev) => {
      return prev.map((item) =>
        Number(item.id) === numericId
          ? {
              ...item,
              verificationStatus: ProductMappingVerificationStatus.Verified,
              verifiedAt: new Date().toISOString(),
            }
          : item,
      );
    });

    // 배치 처리를 위해 세션 목록에 즉시 추가 (필터링 시 사라지지 않게 함)
    setProcessedInSessionIds((prev) => new Set(prev).add(String(productMappingId)));
    moveToNext();

    try {
      await verifyProductMapping({
        variables: {
          productMappingId: numericId,
          result: ProductMappingVerificationStatus.Verified,
        },
      });
      showToast('승인되었습니다.', 'success');

      // 약 5개 이상 처리 시 플러시
      setProcessedInSessionIds((prev) => {
        if (prev.size >= 5) {
          setTimeout(flushProcessed, 100);
        }
        return prev;
      });
    } catch (error) {
      // 에러 발생 시 롤백
      refetch();
      showToast('승인 처리 중 오류가 발생했습니다.', 'error');
      console.error(error);
    }
  };

  const handleCancelVerification = async (
    productMappingId: number | string,
    currentStatus: VerificationStatus,
  ) => {
    const numericId = Number(productMappingId);

    // 즉시 UI 업데이트 (타입 비교를 위해 Number로 변환)
    setAllItems((prev) =>
      prev.map((item) =>
        Number(item.id) === numericId
          ? {
              ...item,
              verificationStatus: ProductMappingVerificationStatus.PendingVerification,
              verifiedAt: null,
              verifiedBy: null,
              verificationNote: null,
            }
          : item,
      ),
    );

    try {
      await cancelVerification({
        variables: {
          productMappingId: numericId,
        },
      });
      showToast(
        currentStatus === VerificationStatus.Verified
          ? '승인이 취소되었습니다.'
          : '거부가 취소되었습니다.',
        'success',
      );

      // 세션 처리 목록에서도 제거
      setProcessedInSessionIds((prev) => {
        const next = new Set(prev);
        next.delete(String(productMappingId));
        return next;
      });
    } catch (error) {
      // 에러 발생 시 롤백
      refetch();
      showToast('검증 취소 처리 중 오류가 발생했습니다.', 'error');
      console.error(error);
    }
  };

  const handleReject = async (productMappingId?: number | string, isBatch = false) => {
    if (isBatch) {
      // 일괄 거부
      if (selectedIds.size === 0) {
        showToast('선택된 항목이 없습니다.', 'error');
        return;
      }

      // 즉시 UI 업데이트 (타입 비교를 위해 Number로 변환)
      const selectedIdsArray = Array.from(selectedIds);
      setAllItems((prev) =>
        prev.map((item) =>
          selectedIdsArray.includes(item.id)
            ? {
                ...item,
                verificationStatus: ProductMappingVerificationStatus.Rejected,
                verifiedAt: new Date().toISOString(),
                verificationNote: null,
              }
            : item,
        ),
      );
      setSelectedIds(new Set());

      try {
        const result = await batchVerifyProductMapping({
          variables: {
            productMappingIds: selectedIdsArray.map(Number),
            result: ProductMappingVerificationStatus.Rejected,
            feedback: undefined,
          },
        });
        showToast(
          `${result.data?.batchVerifyProductMapping ?? 0}개 항목이 거부되었습니다.`,
          'success',
        );
        setAllItems([]);
        setProcessedInSessionIds(new Set());
        isInitialLoad.current = true;
        refetch();
      } catch (error) {
        // 에러 발생 시 롤백
        refetch();
        showToast('일괄 거부 처리 중 오류가 발생했습니다.', 'error');
        console.error(error);
      }
    } else {
      // 단일 거부
      const numericId = Number(productMappingId);
      const currentItem = allItems.find((item) => Number(item.id) === numericId);

      // 이미 거부된 경우 취소 처리 (토글)
      if (currentItem?.verificationStatus === ProductMappingVerificationStatus.Rejected) {
        return handleCancelVerification(productMappingId as string, VerificationStatus.Rejected);
      }

      // 즉시 UI 업데이트
      setAllItems((prev) =>
        prev.map((item) =>
          Number(item.id) === numericId
            ? {
                ...item,
                verificationStatus: ProductMappingVerificationStatus.Rejected,
                verifiedAt: new Date().toISOString(),
                verificationNote: null,
              }
            : item,
        ),
      );

      // 세션 목록에 즉시 추가 및 다음 이동
      setProcessedInSessionIds((prev) => new Set(prev).add(String(productMappingId)));
      moveToNext();

      try {
        await verifyProductMapping({
          variables: {
            productMappingId: numericId,
            result: ProductMappingVerificationStatus.Rejected,
            feedback: undefined,
          },
        });
        showToast('거부되었습니다.', 'success');

        // 약 5개 이상 처리 시 플러시
        setProcessedInSessionIds((prev) => {
          if (prev.size >= 5) {
            setTimeout(flushProcessed, 100);
          }
          return prev;
        });
      } catch (error) {
        // 에러 발생 시 롤백
        refetch();
        showToast('거부 처리 중 오류가 발생했습니다.', 'error');
        console.error(error);
      }
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === pendingVerifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingVerifications.map((v) => String(v.id))));
    }
  };

  const handleBatchVerify = async () => {
    if (selectedIds.size === 0) {
      showToast('선택된 항목이 없습니다.', 'error');
      return;
    }

    // 즉시 UI 업데이트 (타입 비교를 위해 Number로 변환)
    const selectedIdsArray = Array.from(selectedIds);
    setAllItems((prev) =>
      prev.map((item) =>
        selectedIdsArray.includes(item.id)
          ? {
              ...item,
              verificationStatus: ProductMappingVerificationStatus.Verified,
              verifiedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    setSelectedIds(new Set());

    try {
      const result = await batchVerifyProductMapping({
        variables: {
          productMappingIds: selectedIdsArray.map(Number),
          result: ProductMappingVerificationStatus.Verified,
        },
      });
      showToast(
        `${result.data?.batchVerifyProductMapping ?? 0}개 항목이 승인되었습니다.`,
        'success',
      );
      setAllItems([]);
      setProcessedInSessionIds(new Set());
      isInitialLoad.current = true;
      refetch();
    } catch (error) {
      // 에러 발생 시 롤백
      refetch();
      showToast('일괄 승인 처리 중 오류가 발생했습니다.', 'error');
      console.error(error);
    }
  };

  const handleOpenDeleteModal = (productId: number, productTitle: string | null) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productTitle,
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      productId: null,
      productTitle: null,
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.productId) return;

    try {
      await removeProductMapping({
        variables: {
          productId: deleteModal.productId,
        },
      });
      showToast('매핑이 삭제되었습니다.', 'success');
      handleCloseDeleteModal();
      // 삭제 후 목록에서 제거
      setAllItems((prev) => prev.filter((item) => item.productId !== deleteModal.productId));
    } catch (error) {
      showToast('매핑 삭제 중 오류가 발생했습니다.', 'error');
      console.error(error);
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const pendingVerifications = allItems.length > 0 ? allItems : (data?.pendingVerifications ?? []);

  const filteredItems = pendingVerifications.filter((item) => {
    // Pending 필터일 때, 이번 세션에서 처리된 항목은 아직 보여줌 (배치 처리를 위해)
    const isProcessedInSession = processedInSessionIds.has(item.id);
    const statusMatch =
      statusFilter === 'ALL' || item.verificationStatus === statusFilter || isProcessedInSession;
    if (!statusMatch) return false;

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      String(item.id).includes(query) ||
      String(item.productId).includes(query) ||
      item.product?.title?.toLowerCase().includes(query) ||
      item.brandProduct?.toLowerCase().includes(query)
    );
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Input이나 TextArea가 활성 상태면 단축키 무시
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (filteredItems.length === 0) return;

      const item = focusedIndex >= 0 ? filteredItems[focusedIndex] : null;

      switch (e.key.toLowerCase()) {
        case 'j':
        case 'arrowdown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
          break;
        case 'k':
        case 'arrowup':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'a': {
          if (item) {
            handleVerify(item.id);
          }
          break;
        }
        case 'r': {
          if (item) {
            handleReject(item.id);
          }
          break;
        }
        case 'd': {
          if (deleteModal.isOpen) {
            handleCloseDeleteModal();
          } else if (item) {
            handleOpenDeleteModal(item.productId, item.product?.title ?? null);
          }
          break;
        }
        case ' ':
        case 'spacebar': {
          if (focusedIndex >= 0) {
            e.preventDefault();
            handleToggleSelect(filteredItems[focusedIndex].id);
          }
          break;
        }
        case 'enter': {
          if (focusedIndex >= 0) {
            toggleRow(filteredItems[focusedIndex].id);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, filteredItems, deleteModal.isOpen]);

  // 스크롤 동기화
  useEffect(() => {
    if (focusedIndex >= 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tr');
      const focusedRow = rows[focusedIndex] as HTMLElement;
      if (focusedRow) {
        // 배치 플러시 후에는 최상단으로, 평소에는 화면 안으로만 이동 (less jumpy)
        focusedRow.scrollIntoView({
          behavior: 'smooth',
          block: focusedIndex === 0 ? 'center' : 'nearest',
        });
      }
    }
  }, [focusedIndex]);

  // 데이터가 변경되면 allItems 업데이트 (초기 로드 시에만)
  useEffect(() => {
    if (data?.pendingVerifications && isInitialLoad.current && allItems.length === 0) {
      setAllItems(data.pendingVerifications);
      isInitialLoad.current = false;

      // 다음 커서 업데이트
      const lastItem = data.pendingVerifications[data.pendingVerifications.length - 1];
      if (lastItem?.searchAfter) {
        setSearchAfter(lastItem.searchAfter);
      } else {
        setSearchAfter(null);
      }
    }
  }, [data, allItems.length]);

  // prioritizeOld 변경 시 초기화 및 재로드
  useEffect(() => {
    setAllItems([]);
    setSearchAfter(null);
    setSelectedIds(new Set());
    isInitialLoad.current = true; // 초기 로드 플래그 리셋
    // prioritizeOld가 변경되면 첫 페이지부터 다시 로드
    refetch({
      searchAfter: null,
      prioritizeOld,
    });
  }, [prioritizeOld, refetch]);

  const handleLoadMore = useCallback(async () => {
    if (!searchAfter || queryLoading) return;

    try {
      const result = await fetchMore({
        variables: {
          searchAfter,
          limit: PAGE_LIMIT,
          prioritizeOld,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            pendingVerifications: [
              ...prev.pendingVerifications,
              ...fetchMoreResult.pendingVerifications,
            ],
          };
        },
      });

      // fetchMore 결과를 allItems에 추가 (optimistic update 보존)
      if (result.data?.pendingVerifications) {
        setAllItems((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const newItems = result.data.pendingVerifications.filter(
            (item) => !existingIds.has(item.id),
          );
          return [...prev, ...newItems];
        });

        // 다음 커서 업데이트
        const lastItem =
          result.data.pendingVerifications[result.data.pendingVerifications.length - 1];
        if (lastItem?.searchAfter) {
          setSearchAfter(lastItem.searchAfter);
        } else {
          setSearchAfter(null);
        }
      }
    } catch (error) {
      console.error('더 보기 로드 중 오류:', error);
      showToast('더 보기 로드 중 오류가 발생했습니다.', 'error');
    }
  }, [searchAfter, queryLoading, fetchMore, prioritizeOld]);

  // 키보드 네비게이션으로 마지막 항목 근처 도달 시 추가 로딩
  useEffect(() => {
    if (focusedIndex >= filteredItems.length - 5 && filteredItems.length > 0) {
      handleLoadMore();
    }
  }, [focusedIndex, filteredItems.length, handleLoadMore]);

  const handlePrioritizeChange = (newPrioritizeOld: boolean) => {
    setPrioritizeOld(newPrioritizeOld);
    setSelectedIds(new Set());
  };

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (queryLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && searchAfter) {
          handleLoadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [queryLoading, searchAfter, handleLoadMore],
  );

  const hasNextPage =
    pendingVerifications.length > 0 &&
    pendingVerifications.length % PAGE_LIMIT === 0 &&
    searchAfter != null;

  if (error) {
    return (
      <div className="w-full rounded-sm border border-stroke bg-white px-5 py-10 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="text-red-500 dark:text-red-400 text-center">
          오류가 발생했습니다: {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="mx-auto mt-4 block rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (queryLoading && pendingVerifications.length === 0) {
    return (
      <div className="w-full rounded-sm border border-stroke bg-white px-5 py-10 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="text-gray-500 dark:text-gray-400 text-center">로딩 중...</p>
      </div>
    );
  }

  if (pendingVerifications.length === 0) {
    return (
      <div className="w-full rounded-sm border border-stroke bg-white px-5 py-10 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          검증 대기 중인 항목이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      {toast.isOpen && (
        <div
          className={`fixed right-5 top-5 z-[9999] rounded-md px-4 py-3 text-sm text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        >
          {toast.message}
        </div>
      )}
      <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {/* 필터 및 일괄 액션 */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-black dark:text-white">상태:</span>
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  statusFilter === ProductMappingVerificationStatus.PendingVerification
                    ? 'bg-warning text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
                }`}
                onClick={() => {
                  setStatusFilter(ProductMappingVerificationStatus.PendingVerification);
                  setFocusedIndex(-1);
                }}
              >
                대기 (
                {
                  allItems.filter(
                    (i) =>
                      i.verificationStatus === ProductMappingVerificationStatus.PendingVerification,
                  ).length
                }
                )
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  statusFilter === ProductMappingVerificationStatus.Verified
                    ? 'bg-success text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
                }`}
                onClick={() => {
                  setStatusFilter(ProductMappingVerificationStatus.Verified);
                  setFocusedIndex(-1);
                }}
              >
                승인 (
                {
                  allItems.filter(
                    (i) => i.verificationStatus === ProductMappingVerificationStatus.Verified,
                  ).length
                }
                )
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  statusFilter === ProductMappingVerificationStatus.Rejected
                    ? 'bg-danger text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
                }`}
                onClick={() => {
                  setStatusFilter(ProductMappingVerificationStatus.Rejected);
                  setFocusedIndex(-1);
                }}
              >
                거부 (
                {
                  allItems.filter(
                    (i) => i.verificationStatus === ProductMappingVerificationStatus.Rejected,
                  ).length
                }
                )
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  statusFilter === 'ALL'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
                }`}
                onClick={() => {
                  setStatusFilter('ALL');
                  setFocusedIndex(-1);
                }}
              >
                전체 ({allItems.length})
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black dark:text-white">정렬:</span>
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  !prioritizeOld
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
                }`}
                onClick={() => handlePrioritizeChange(false)}
              >
                최신순
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  prioritizeOld
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
                }`}
                onClick={() => handlePrioritizeChange(true)}
              >
                오래된순
              </button>
            </div>
            <div className="relative">
              <span className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="ID, 상품명, 브랜드 검색..."
                className="bg-gray-50 w-64 rounded-md border border-stroke py-1.5 pl-9 pr-4 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black dark:text-white">
                {selectedIds.size}개 선택됨
              </span>
              <button
                className="whitespace-nowrap rounded-md bg-success bg-opacity-10 px-3 py-1.5 text-sm font-medium text-success hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleBatchVerify}
                disabled={batchLoading || loading}
              >
                일괄 승인
              </button>
              <button
                className="whitespace-nowrap rounded-md bg-danger bg-opacity-10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleReject(undefined, true)}
                disabled={batchLoading || loading}
              >
                일괄 거부
              </button>
            </div>
          )}
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[40px] px-1 py-4 text-center font-medium text-black dark:text-white">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === pendingVerifications.length &&
                      pendingVerifications.length > 0
                    }
                    onChange={handleSelectAll}
                    className="border-gray-300 h-4 w-4 rounded text-primary focus:ring-2 focus:ring-primary"
                  />
                </th>
                <th className="min-w-[40px] px-1 py-4 text-center font-medium text-black dark:text-white">
                  ID
                </th>
                <th className="min-w-[60px] px-1 py-4 text-center font-medium text-black dark:text-white">
                  PID
                </th>
                <th className="min-w-[340px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  상품명
                </th>
                <th className="min-w-[280px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  다나와 상품명
                </th>
                <th className="min-w-[50px] px-1 py-4 text-center font-medium text-black dark:text-white">
                  유사
                </th>
                <th className="min-w-[70px] px-1 py-4 text-center font-medium text-black dark:text-white">
                  상태
                </th>
                <th className="min-w-[140px] px-1 py-4 text-center font-medium text-black dark:text-white">
                  액션
                </th>
                <th className="min-w-[140px] px-1 py-4 text-center font-medium text-black dark:text-white">
                  정보
                </th>
              </tr>
            </thead>
            <tbody ref={tableRef}>
              {filteredItems.map((item, index) => {
                const verification = item as PendingVerification;
                const similarity = getJaccardSimilarity(
                  verification.product?.title ?? '',
                  verification.brandProduct ?? '',
                );

                const isExpanded = expandedIds.has(verification.id);
                const isFocused = focusedIndex === index;
                const isProcessed = processedInSessionIds.has(verification.id);

                return (
                  <Fragment key={verification.id}>
                    <tr
                      data-index={index}
                      className={`cursor-pointer transition-colors ${
                        isFocused ? 'bg-primary bg-opacity-5' : ''
                      } ${
                        isProcessed
                          ? 'opacity-50 grayscale-[0.5] hover:bg-transparent'
                          : 'hover:bg-slate-50 dark:hover:bg-meta-4'
                      }`}
                      onClick={() => toggleRow(verification.id)}
                    >
                      <td className="border-b border-[#eee] px-2 py-3 text-center dark:border-strokedark">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(String(verification.id))}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(String(verification.id));
                          }}
                          className="border-gray-300 h-4 w-4 rounded text-primary focus:ring-2 focus:ring-primary"
                        />
                      </td>
                      <td className="border-b border-[#eee] px-2 py-3 text-center dark:border-strokedark">
                        <p className="text-black dark:text-white">{verification.id}</p>
                      </td>
                      <td className="border-b border-[#eee] px-2 py-3 text-center dark:border-strokedark">
                        <Link
                          href={`https://jirum-alarm.com/products/${verification.productId}`}
                          target="_blank"
                          className="text-sm text-primary underline-offset-2 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {verification.productId}
                        </Link>
                      </td>
                      <td className="border-b border-[#eee] px-2 py-3 text-center dark:border-strokedark">
                        <p className="whitespace-normal text-sm text-black dark:text-white">
                          {verification.product?.title ?? '-'}
                        </p>
                        {!verification.product?.title && (
                          <p className="text-gray-400 mt-1 text-xs">
                            (Product ID: {verification.productId})
                          </p>
                        )}
                      </td>
                      <td className="border-b border-[#eee] px-2 py-3 text-center dark:border-strokedark">
                        <div className="flex flex-col gap-1">
                          <p className="whitespace-normal text-sm text-black dark:text-white">
                            {verification.brandProduct ?? '-'}
                          </p>
                          <div className="flex justify-center gap-2">
                            <button
                              className="text-gray-400 text-[10px] hover:text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `https://search.danawa.com/mobile/dsearch.php?keyword=${encodeURIComponent(
                                    verification.product?.title ?? '',
                                  )}`,
                                  '_blank',
                                );
                              }}
                            >
                              다나와 검색
                            </button>
                            <button
                              className="text-gray-400 text-[10px] hover:text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `https://m.search.naver.com/search.naver?query=${encodeURIComponent(
                                    verification.product?.title ?? '',
                                  )}`,
                                  '_blank',
                                );
                              }}
                            >
                              네이버 검색
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                        <span
                          className={`text-sm font-bold ${
                            similarity >= 0.9
                              ? 'text-success'
                              : similarity < 0.5
                                ? 'text-danger'
                                : 'text-warning'
                          }`}
                        >
                          {(similarity * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                            verification.verificationStatus
                              ? VerificationStatusColorMap[verification.verificationStatus]
                              : ''
                          }`}
                        >
                          {verification.verificationStatus
                            ? VerificationStatusMap[verification.verificationStatus]
                            : '-'}
                        </span>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center justify-center gap-2">
                          {verification.verificationStatus ===
                          ProductMappingVerificationStatus.Verified ? (
                            <button
                              className="whitespace-nowrap rounded-md bg-success bg-opacity-10 px-3 py-1.5 text-sm font-medium text-success hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelVerification(
                                  Number(verification.id),
                                  ProductMappingVerificationStatus.Verified,
                                );
                              }}
                              disabled={loading || removeLoading || cancelLoading}
                            >
                              승인 취소
                            </button>
                          ) : verification.verificationStatus ===
                            ProductMappingVerificationStatus.Rejected ? (
                            <button
                              className="whitespace-nowrap rounded-md bg-danger bg-opacity-10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelVerification(
                                  Number(verification.id),
                                  ProductMappingVerificationStatus.Rejected,
                                );
                              }}
                              disabled={loading || removeLoading || cancelLoading}
                            >
                              거부 취소
                            </button>
                          ) : (
                            <>
                              <button
                                title="Approve (A)"
                                className="whitespace-nowrap rounded-md bg-success bg-opacity-10 px-3 py-1.5 text-sm font-medium text-success hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerify(verification.id);
                                }}
                                disabled={loading || removeLoading}
                              >
                                승인
                              </button>
                              <button
                                title="Reject (R)"
                                className="whitespace-nowrap rounded-md bg-danger bg-opacity-10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(verification.id);
                                }}
                                disabled={loading || removeLoading}
                              >
                                거부
                              </button>
                            </>
                          )}
                          <button
                            title="Delete (D)"
                            className="whitespace-nowrap rounded-md bg-slate-600 bg-opacity-10 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteModal(
                                verification.productId,
                                verification.product?.title ?? null,
                              );
                            }}
                            disabled={loading || removeLoading}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                      <td className="border-b border-[#eee] px-2 py-3 text-center dark:border-strokedark">
                        <div className="flex flex-col items-start gap-1 text-left text-xs text-slate-600 dark:text-slate-300">
                          <span className="w-full truncate">
                            검증: {verification.verifiedBy ?? '-'}
                          </span>
                          <span className="w-full truncate">
                            날짜:{' '}
                            {verification.verifiedAt
                              ? dateFormatter(verification.verifiedAt).split(' ')[0]
                              : '-'}
                          </span>
                          <span
                            className="max-w-[120px] truncate text-[10px] text-black dark:text-white"
                            title={verification.verificationNote ?? ''}
                          >
                            비고: {verification.verificationNote ?? '-'}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={9}
                          className="bg-slate-50 px-4 py-6 shadow-inner dark:bg-meta-4"
                        >
                          <div className="flex gap-10">
                            {/* Jirum Alarm Info */}
                            <div className="flex-1 rounded-lg border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
                              <h4 className="text-gray-500 mb-3 text-xs font-bold uppercase tracking-wider">
                                지름알람 상품 정보
                              </h4>
                              <div className="flex gap-4">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded border border-stroke dark:border-strokedark">
                                  {verification.product?.thumbnail ? (
                                    <img
                                      src={verification.product.thumbnail}
                                      alt="Product"
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <div className="bg-gray-100 text-gray-400 flex h-full w-full items-center justify-center text-[10px]">
                                      이미지 없음
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="mb-2 line-clamp-2 text-sm font-medium text-black dark:text-white">
                                    {verification.product?.title}
                                  </p>
                                  <Link
                                    href={`https://jirum-alarm.com/products/${verification.productId}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-opacity-80 hover:underline"
                                  >
                                    상품 페이지 이동
                                    <svg
                                      className="h-3 w-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </Link>
                                </div>
                              </div>
                            </div>

                            {/* Danawa Info */}
                            <div className="flex-1 rounded-lg border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
                              <h4 className="text-gray-400 mb-3 flex justify-between text-xs font-bold uppercase tracking-wider">
                                <span>다나와/브랜드 매칭 정보</span>
                                {verification.danawaUrl && (
                                  <Link
                                    href={verification.danawaUrl}
                                    target="_blank"
                                    className="scale-90 transform font-normal text-primary hover:underline"
                                  >
                                    다나와 페이지기 이동
                                  </Link>
                                )}
                              </h4>
                              <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-black dark:text-white">
                                  {verification.brandProduct ?? '정보 없음'}
                                </p>
                                <div className="mt-2 flex gap-2">
                                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    Target ID: {verification.id}
                                  </span>
                                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    Created: {dateFormatter(verification.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Infinite scroll observer target */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="flex items-center justify-center py-6">
            {queryLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>불러오는 중...</span>
              </div>
            )}
          </div>
        )}

        {!hasNextPage && pendingVerifications.length > 0 && (
          <div className="py-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              모든 항목을 불러왔습니다. (총 {pendingVerifications.length}개)
            </p>
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-bold text-black dark:text-white">매핑 삭제 확인</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              정말로 이 매핑을 삭제하시겠습니까?
            </p>
            {deleteModal.productTitle && (
              <p className="mb-4 text-sm font-medium text-black dark:text-white">
                상품: {deleteModal.productTitle}
              </p>
            )}
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-xs">
              Product ID: {deleteModal.productId}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-gray-200 hover:bg-gray-300 rounded-md px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-80"
                onClick={handleCloseDeleteModal}
                disabled={removeLoading}
              >
                취소
              </button>
              <button
                className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDelete}
                disabled={removeLoading}
              >
                {removeLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerificationTable;
