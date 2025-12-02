'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

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

const VerificationStatusMap: Record<VerificationStatus, string> = {
  [VerificationStatus.PendingVerification]: '검증 대기',
  [VerificationStatus.Verified]: '승인됨',
  [VerificationStatus.Rejected]: '거부됨',
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
  const isInitialLoad = useRef(true);

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
  const [cancelVerification, { loading: cancelLoading }] = useCancelVerification();
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    productMappingId: number | null;
    isBatch: boolean;
  }>({
    isOpen: false,
    productMappingId: null,
    isBatch: false,
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: number | null;
    productTitle: string | null;
  }>({
    isOpen: false,
    productId: null,
    productTitle: null,
  });
  const [feedback, setFeedback] = useState('');

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

  const handleVerify = async (productMappingId: number | string) => {
    const numericId = Number(productMappingId);

    // 즉시 UI 업데이트 (타입 비교를 위해 Number로 변환)
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

    try {
      await verifyProductMapping({
        variables: {
          productMappingId: numericId,
          result: ProductMappingVerificationStatus.Verified,
        },
      });
      showToast('승인되었습니다.', 'success');
    } catch (error) {
      // 에러 발생 시 롤백
      refetch();
      alert('승인 처리 중 오류가 발생했습니다.');
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
    } catch (error) {
      // 에러 발생 시 롤백
      refetch();
      alert('검증 취소 처리 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const handleOpenRejectModal = (productMappingId: number | string, isBatch = false) => {
    setFeedbackModal({ isOpen: true, productMappingId: Number(productMappingId), isBatch });
    setFeedback('');
  };

  const handleCloseRejectModal = () => {
    setFeedbackModal({ isOpen: false, productMappingId: null, isBatch: false });
    setFeedback('');
  };

  const handleReject = async () => {
    if (feedbackModal.isBatch) {
      // 일괄 거부
      if (selectedIds.size === 0) {
        alert('선택된 항목이 없습니다.');
        return;
      }

      const feedbackValue = feedback.trim() || undefined;

      // 즉시 UI 업데이트 (타입 비교를 위해 Number로 변환)
      const selectedIdsArray = Array.from(selectedIds);
      setAllItems((prev) =>
        prev.map((item) =>
          selectedIdsArray.includes(item.id)
            ? {
                ...item,
                verificationStatus: ProductMappingVerificationStatus.Rejected,
                verifiedAt: new Date().toISOString(),
                verificationNote: feedbackValue ?? null,
              }
            : item,
        ),
      );
      setSelectedIds(new Set());
      handleCloseRejectModal();

      try {
        const result = await batchVerifyProductMapping({
          variables: {
            productMappingIds: selectedIdsArray.map(Number),
            result: ProductMappingVerificationStatus.Rejected,
            feedback: feedbackValue,
          },
        });
        showToast(
          `${result.data?.batchVerifyProductMapping ?? 0}개 항목이 거부되었습니다.`,
          'success',
        );
      } catch (error) {
        // 에러 발생 시 롤백
        refetch();
        alert('일괄 거부 처리 중 오류가 발생했습니다.');
        console.error(error);
      }
    } else {
      // 단일 거부
      if (!feedbackModal.productMappingId) return;

      const feedbackValue = feedback.trim() || undefined;

      // 즉시 UI 업데이트
      setAllItems((prev) =>
        prev.map((item) =>
          item.id === String(feedbackModal.productMappingId)
            ? {
                ...item,
                verificationStatus: ProductMappingVerificationStatus.Rejected,
                verifiedAt: new Date().toISOString(),
                verificationNote: feedbackValue ?? null,
              }
            : item,
        ),
      );
      handleCloseRejectModal();

      try {
        await verifyProductMapping({
          variables: {
            productMappingId: feedbackModal.productMappingId,
            result: ProductMappingVerificationStatus.Rejected,
            feedback: feedbackValue,
          },
        });
        showToast('거부되었습니다.', 'success');
      } catch (error) {
        // 에러 발생 시 롤백
        refetch();
        alert('거부 처리 중 오류가 발생했습니다.');
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
      alert('선택된 항목이 없습니다.');
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
    } catch (error) {
      // 에러 발생 시 롤백
      refetch();
      alert('일괄 승인 처리 중 오류가 발생했습니다.');
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
      alert('매핑 삭제 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

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
      alert('더 보기 로드 중 오류가 발생했습니다.');
    }
  }, [searchAfter, queryLoading, fetchMore, prioritizeOld]);

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

  const pendingVerifications = allItems.length > 0 ? allItems : (data?.pendingVerifications ?? []);
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
                onClick={() => handleOpenRejectModal(0, true)}
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
                <th className="min-w-[50px] px-4 py-4 text-center font-medium text-black dark:text-white">
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
                <th className="min-w-[80px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  ID
                </th>
                <th className="min-w-[140px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  Product ID
                </th>
                <th className="px-4 py-4 text-center font-medium text-black dark:text-white">
                  상품명
                </th>
                <th className="px-4 py-4 text-center font-medium text-black dark:text-white">
                  다나와 상품명
                </th>
                <th className="min-w-[120px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  검증 상태
                </th>
                <th className="min-w-[160px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  액션
                </th>
                <th className="min-w-[220px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  검증 정보
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-slate-50 dark:hover:bg-meta-4">
                  <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(String(verification.id))}
                      onChange={() => handleToggleSelect(String(verification.id))}
                      className="border-gray-300 h-4 w-4 rounded text-primary focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                    <p className="text-black dark:text-white">{verification.id}</p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                    <Link
                      href={`https://jirum-alarm.com/products/${verification.productId}`}
                      target="_blank"
                      className="text-sm text-primary underline-offset-2 hover:underline"
                    >
                      {verification.productId}
                    </Link>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                    <p className="whitespace-normal text-sm text-black dark:text-white">
                      {verification.product?.title ?? '-'}
                    </p>
                    {!verification.product?.title && (
                      <p className="text-gray-400 mt-1 text-xs">
                        (Product ID: {verification.productId})
                      </p>
                    )}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                    <p className="whitespace-normal text-sm text-black dark:text-white">
                      {verification.brandProduct ?? '-'}
                    </p>
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
                          onClick={() =>
                            handleCancelVerification(
                              Number(verification.id),
                              ProductMappingVerificationStatus.Verified,
                            )
                          }
                          disabled={loading || removeLoading || cancelLoading}
                        >
                          승인 취소
                        </button>
                      ) : verification.verificationStatus ===
                        ProductMappingVerificationStatus.Rejected ? (
                        <button
                          className="whitespace-nowrap rounded-md bg-danger bg-opacity-10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() =>
                            handleCancelVerification(
                              Number(verification.id),
                              ProductMappingVerificationStatus.Rejected,
                            )
                          }
                          disabled={loading || removeLoading || cancelLoading}
                        >
                          거부 취소
                        </button>
                      ) : (
                        <>
                          <button
                            className="whitespace-nowrap rounded-md bg-success bg-opacity-10 px-3 py-1.5 text-sm font-medium text-success hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => handleVerify(verification.id)}
                            disabled={loading || removeLoading}
                          >
                            승인
                          </button>
                          <button
                            className="whitespace-nowrap rounded-md bg-danger bg-opacity-10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => handleOpenRejectModal(verification.id)}
                            disabled={loading || removeLoading}
                          >
                            거부
                          </button>
                        </>
                      )}
                      <button
                        className="whitespace-nowrap rounded-md bg-slate-600 bg-opacity-10 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400"
                        onClick={() =>
                          handleOpenDeleteModal(
                            verification.productId,
                            verification.product?.title ?? null,
                          )
                        }
                        disabled={loading || removeLoading}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                    <div className="flex flex-col items-start gap-1 text-left text-xs text-slate-600 dark:text-slate-300">
                      <span>검증자: {verification.verifiedBy ?? '-'}</span>
                      <span>
                        검증일:{' '}
                        {verification.verifiedAt ? dateFormatter(verification.verifiedAt) : '-'}
                      </span>
                      <span className="max-w-[260px] truncate text-[11px] text-black dark:text-white">
                        비고: {verification.verificationNote ?? '-'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* 거부 사유 입력 모달 */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
              {feedbackModal.isBatch ? '일괄 거부 사유 입력' : '거부 사유 입력'}
            </h3>
            {feedbackModal.isBatch && (
              <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">
                {selectedIds.size}개 항목을 거부합니다.
              </p>
            )}
            <textarea
              className="w-full rounded-md border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
              rows={4}
              placeholder="거부 사유를 입력해주세요. (선택)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-gray-200 hover:bg-gray-300 rounded-md px-4 py-2 text-sm font-medium text-black dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-80"
                onClick={handleCloseRejectModal}
                disabled={batchLoading || loading}
              >
                취소
              </button>
              <button
                className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleReject}
                disabled={batchLoading || loading}
              >
                {batchLoading || loading ? '처리 중...' : '거부'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerificationTable;
