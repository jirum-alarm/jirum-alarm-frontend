'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

import { useGetVerificationHistory } from '@/hooks/graphql/verification';
import {
  OrderOptionType,
  ProductMappingVerificationStatus,
  VerificationResult,
  VerificationStatus,
} from '@/types/verification';
import { dateFormatter } from '@/utils/date';

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

const VerificationHistory = () => {
  const [verificationStatus, setVerificationStatus] = useState<ProductMappingVerificationStatus[]>(
    [],
  );
  const [orderBy, setOrderBy] = useState<OrderOptionType>(OrderOptionType.Desc);
  const [searchAfter, setSearchAfter] = useState<string[] | null>(null);

  const { data, loading, fetchMore, error, refetch } = useGetVerificationHistory({
    verificationStatus: verificationStatus.length > 0 ? verificationStatus : undefined,
    orderBy,
    searchAfter,
  });

  const handleLoadMore = useCallback(() => {
    const lastItem = data?.verificationHistory[data.verificationHistory.length - 1];
    if (lastItem?.searchAfter) {
      fetchMore({
        variables: {
          searchAfter: lastItem.searchAfter,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            verificationHistory: [
              ...prev.verificationHistory,
              ...fetchMoreResult.verificationHistory,
            ],
          };
        },
      });
    }
  }, [data, fetchMore]);

  const handleStatusFilter = (status: ProductMappingVerificationStatus) => {
    setSearchAfter(null);
    setVerificationStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const historyItems = data?.verificationHistory ?? [];
  const hasNextPage = historyItems.length > 0 && historyItems[historyItems.length - 1]?.searchAfter;

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          handleLoadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasNextPage, handleLoadMore],
  );

  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {/* 필터 섹션 */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black dark:text-white">상태 필터:</span>
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              verificationStatus.includes(ProductMappingVerificationStatus.Verified)
                ? 'bg-success text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
            }`}
            onClick={() => handleStatusFilter(ProductMappingVerificationStatus.Verified)}
          >
            승인됨
          </button>
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              verificationStatus.includes(ProductMappingVerificationStatus.Rejected)
                ? 'bg-danger text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
            }`}
            onClick={() => handleStatusFilter(ProductMappingVerificationStatus.Rejected)}
          >
            거부됨
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black dark:text-white">정렬:</span>
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              orderBy === OrderOptionType.Desc
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
            }`}
            onClick={() => {
              setOrderBy(OrderOptionType.Desc);
              setSearchAfter(null);
            }}
          >
            최신순
          </button>
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              orderBy === OrderOptionType.Asc
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
            }`}
            onClick={() => {
              setOrderBy(OrderOptionType.Asc);
              setSearchAfter(null);
            }}
          >
            오래된순
          </button>
        </div>
      </div>

      {error ? (
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
      ) : loading && historyItems.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 py-10 text-center">로딩 중...</div>
      ) : historyItems.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 py-10 text-center">
          검증 이력이 없습니다.
        </div>
      ) : (
        <>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
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
                  <th className="min-w-[220px] px-4 py-4 text-center font-medium text-black dark:text-white">
                    검증 정보
                  </th>
                  <th className="min-w-[160px] px-4 py-4 text-center font-medium text-black dark:text-white">
                    생성일
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-meta-4">
                    <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.id}</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                      <Link
                        href={`https://jirum-alarm.com/products/${item.productId}`}
                        target="_blank"
                        className="text-sm text-primary underline-offset-2 hover:underline"
                      >
                        {item.productId}
                      </Link>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                      <p className="whitespace-normal text-sm text-black dark:text-white">
                        {item.product?.title ?? '-'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                      <p className="whitespace-normal text-sm text-black dark:text-white">
                        {item.brandProduct ?? '-'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          item.verificationStatus
                            ? VerificationStatusColorMap[item.verificationStatus]
                            : ''
                        }`}
                      >
                        {item.verificationStatus
                          ? VerificationStatusMap[item.verificationStatus]
                          : '-'}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                      <div className="flex flex-col items-start gap-1 text-left text-xs text-slate-600 dark:text-slate-300">
                        <span>검증자: {item.verifiedBy ?? '-'}</span>
                        <span>
                          검증일: {item.verifiedAt ? dateFormatter(item.verifiedAt) : '-'}
                        </span>
                        <span className="max-w-[260px] truncate text-[11px] text-black dark:text-white">
                          비고: {item.verificationNote ?? '-'}
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">
                        {item.createdAt ? dateFormatter(item.createdAt) : '-'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Infinite scroll observer target */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-6">
              {loading && (
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

          {!hasNextPage && historyItems.length > 0 && (
            <div className="py-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                모든 항목을 불러왔습니다. (총 {historyItems.length}개)
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VerificationHistory;
