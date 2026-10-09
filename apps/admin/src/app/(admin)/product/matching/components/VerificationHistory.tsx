'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

import Panel from '@/components/Panel';
import Spinner from '@/components/Spinner';
import { useToast } from '@/components/Toast';
import { OrderOptionType, ProductMappingVerificationStatus } from '@/generated/gql/graphql';
import { useAdminMe } from '@/hooks/graphql/auth';
import { useCancelVerification, useGetVerificationHistory } from '@/hooks/graphql/verification';
import { dateFormatter } from '@/utils/date';

const VerificationStatusMap: Record<ProductMappingVerificationStatus, string> = {
  [ProductMappingVerificationStatus.PendingVerification]: '검증 대기',
  [ProductMappingVerificationStatus.Verified]: '승인됨',
  [ProductMappingVerificationStatus.Rejected]: '거부됨',
};

const VerificationStatusColorMap: Record<ProductMappingVerificationStatus, string> = {
  [ProductMappingVerificationStatus.PendingVerification]: 'bg-warning text-warning bg-opacity-10',
  [ProductMappingVerificationStatus.Verified]: 'bg-success text-success bg-opacity-10',
  [ProductMappingVerificationStatus.Rejected]: 'bg-danger text-danger bg-opacity-10',
};

const VerificationHistory = () => {
  const toast = useToast();
  const [verificationStatus, setVerificationStatus] = useState<ProductMappingVerificationStatus[]>(
    [],
  );
  const [orderBy, setOrderBy] = useState<OrderOptionType>(OrderOptionType.Desc);
  const [searchAfter, setSearchAfter] = useState<string[] | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // 현재 로그인한 사용자 정보
  const { data: adminMeData } = useAdminMe();
  const myAdminId = adminMeData?.adminMe?.id ? parseInt(adminMeData.adminMe.id) : undefined;

  const { data, loading, fetchMore, refetch } = useGetVerificationHistory({
    verificationStatus: verificationStatus.length > 0 ? verificationStatus : undefined,
    orderBy,
    searchAfter,
    verifiedBy: onlyMine && myAdminId ? myAdminId : undefined,
  });

  const [cancelVerificationMutation] = useCancelVerification();

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

  const handleToggleOnlyMine = () => {
    setSearchAfter(null);
    setOnlyMine((prev) => !prev);
  };

  const handleCancelVerification = useCallback(
    async (itemId: string) => {
      if (cancellingId) return;
      setCancellingId(itemId);
      try {
        await cancelVerificationMutation({
          variables: {
            productMappingId: parseInt(itemId),
            reason: '매칭 결과 목록에서 취소',
          },
        });
        // refetch to update the list
        await refetch();
      } catch (error) {
        console.error('Cancel verification failed:', error);
        toast.error('검증 취소에 실패했습니다.');
      } finally {
        setCancellingId(null);
      }
    },
    [cancellingId, cancelVerificationMutation, refetch, toast],
  );

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

  const isMyVerification = (item: { verifiedBy?: { id: string } | null }) => {
    return adminMeData?.adminMe?.id && item.verifiedBy?.id === adminMeData.adminMe.id;
  };

  return (
    <Panel rounded="sm" className="w-full px-4 pb-2.5 pt-4 sm:px-7.5 sm:pt-6 xl:pb-1">
      {/* 필터 섹션 */}
      <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black dark:text-white">상태 필터:</span>
          <button
            className={`rounded-md px-3 py-2 text-sm font-medium sm:py-1.5 ${
              verificationStatus.includes(ProductMappingVerificationStatus.Verified)
                ? 'bg-success text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
            }`}
            onClick={() => handleStatusFilter(ProductMappingVerificationStatus.Verified)}
          >
            승인됨
          </button>
          <button
            className={`rounded-md px-3 py-2 text-sm font-medium sm:py-1.5 ${
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
            className={`rounded-md px-3 py-2 text-sm font-medium sm:py-1.5 ${
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
            className={`rounded-md px-3 py-2 text-sm font-medium sm:py-1.5 ${
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
        <div className="hidden h-6 w-px bg-gray-300 dark:bg-gray-600 sm:block" />
        <button
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors sm:py-1.5 ${
            onlyMine
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-white'
          }`}
          onClick={handleToggleOnlyMine}
          disabled={!myAdminId}
          title={!myAdminId ? '사용자 정보를 불러오는 중...' : undefined}
        >
          {onlyMine ? (
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              내 것만 보기
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              전체 보기
            </span>
          )}
        </button>
        {adminMeData?.adminMe && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            ({adminMeData.adminMe.name})
          </span>
        )}
      </div>

      {loading && historyItems.length === 0 ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">로딩 중...</div>
      ) : historyItems.length === 0 ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          {onlyMine ? '내가 검증한 이력이 없습니다.' : '검증 이력이 없습니다.'}
        </div>
      ) : (
        <>
          <div className="max-w-full overflow-x-auto">
            <table className="table-cards w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="hidden min-w-[80px] px-4 py-4 text-center font-medium text-black dark:text-white md:table-cell">
                    ID
                  </th>
                  <th className="min-w-[140px] px-4 py-4 text-center font-medium text-black dark:text-white">
                    Product ID
                  </th>
                  <th className="min-w-[180px] px-4 py-4 text-center font-medium text-black dark:text-white lg:min-w-0">
                    상품명
                  </th>
                  <th className="min-w-[160px] px-4 py-4 text-center font-medium text-black dark:text-white lg:min-w-0">
                    다나와 상품명
                  </th>
                  <th className="min-w-[120px] px-4 py-4 text-center font-medium text-black dark:text-white">
                    검증 상태
                  </th>
                  <th className="min-w-[220px] px-4 py-4 text-center font-medium text-black dark:text-white">
                    검증 정보
                  </th>
                  <th className="hidden min-w-[160px] px-4 py-4 text-center font-medium text-black dark:text-white md:table-cell">
                    생성일
                  </th>
                  <th className="min-w-[100px] px-4 py-4 text-center font-medium text-black dark:text-white">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 dark:hover:bg-meta-4 ${
                      isMyVerification(item) ? 'bg-primary/[0.02]' : ''
                    }`}
                  >
                    <td
                      data-label="ID"
                      className="hidden border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark md:table-cell"
                    >
                      <p className="text-black dark:text-white">{item.id}</p>
                    </td>
                    <td
                      data-label="Product ID"
                      className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark"
                    >
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
                    <td
                      data-label="다나와 상품명"
                      className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark"
                    >
                      <p className="whitespace-normal text-sm text-black dark:text-white">
                        {item.brandProduct ?? '-'}
                      </p>
                    </td>
                    <td
                      data-label="검증 상태"
                      className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark"
                    >
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
                    <td
                      data-label="검증 정보"
                      className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark"
                    >
                      <div className="flex flex-col items-start gap-1 text-left text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          검증자:{' '}
                          <span
                            className={isMyVerification(item) ? 'font-semibold text-primary' : ''}
                          >
                            {item.verifiedBy?.name ?? '-'}
                          </span>
                          {isMyVerification(item) && (
                            <span className="rounded bg-primary/10 px-1 py-0.5 text-[11px] font-semibold text-primary">
                              나
                            </span>
                          )}
                        </span>
                        <span>
                          검증일: {item.verifiedAt ? dateFormatter(item.verifiedAt) : '-'}
                        </span>
                        <span className="max-w-[260px] truncate text-[11px] text-black dark:text-white">
                          비고: {item.verificationNote ?? '-'}
                        </span>
                      </div>
                    </td>
                    <td
                      data-label="생성일"
                      className="hidden border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark md:table-cell"
                    >
                      <p className="text-sm text-black dark:text-white">
                        {item.createdAt ? dateFormatter(item.createdAt) : '-'}
                      </p>
                    </td>
                    <td
                      data-label="actions"
                      className="border-b border-[#eee] px-4 py-5 text-center dark:border-strokedark"
                    >
                      {item.verificationStatus &&
                      item.verificationStatus !==
                        ProductMappingVerificationStatus.PendingVerification ? (
                        <button
                          onClick={() => handleCancelVerification(item.id)}
                          disabled={cancellingId === item.id}
                          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-xs font-medium transition-colors sm:py-1.5 ${
                            cancellingId === item.id
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-meta-4 dark:text-gray-600'
                              : 'bg-warning/10 text-warning hover:bg-warning/20'
                          }`}
                          title="검증을 취소하고 대기 상태로 되돌립니다"
                        >
                          {cancellingId === item.id ? (
                            <>
                              <Spinner size="xs" color="current" />
                              취소 중
                            </>
                          ) : (
                            <>
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
                                  d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4"
                                />
                              </svg>
                              취소
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600">-</span>
                      )}
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
                <Spinner
                  size="md"
                  color="current"
                  label="불러오는 중..."
                  className="text-sm text-slate-500 dark:text-slate-400"
                />
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
    </Panel>
  );
};

export default VerificationHistory;
