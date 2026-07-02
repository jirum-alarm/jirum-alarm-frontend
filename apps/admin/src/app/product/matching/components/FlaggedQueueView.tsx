'use client';

import { useQuery } from '@apollo/client';
import { useCallback, useMemo, useState } from 'react';

import {
  OrderOptionType,
  ProductMappingAiSuggestion,
  ProductMappingVerificationStatus,
  QueryPendingVerificationsQuery,
  QueryPendingVerificationsQueryVariables,
  QueryPendingVerificationsTotalCountQuery,
  QueryPendingVerificationsTotalCountQueryVariables,
} from '@/generated/gql/graphql';
import {
  QueryPendingVerifications,
  QueryPendingVerificationsTotalCount,
} from '@/graphql/verification';
import { useVerifyProductMapping } from '@/hooks/graphql/verification';

const PAGE_SIZE = 20;

/** '[26b:REJECT] 근거문장' → 근거문장 */
const stripMarker = (reason?: string | null) => (reason ?? '').replace(/^\[26b:[A-Z]+\]\s*/, '');

/**
 * 거절추천 전용 검수 큐 — 사전분류(26b)가 오매칭 의심 플래그한 매핑만 모아
 * "FP 사냥" 모드로 빠르게 훑는다. 근거 문장을 리스트에 바로 노출해 판단이 한 시선에 끝나게.
 * 기본 활성 딜만(사용자 노출 중) — 종료 딜 오매칭은 급하지 않음.
 */
export default function FlaggedQueueView() {
  const [onlyActive, setOnlyActive] = useState(true);
  const [decided, setDecided] = useState<Record<string, 'approved' | 'rejected'>>({});

  const variables: QueryPendingVerificationsQueryVariables = useMemo(
    () => ({
      limit: PAGE_SIZE,
      orderBy: OrderOptionType.Desc,
      aiSuggestion: ProductMappingAiSuggestion.Reject,
      onlyActive,
      // 의심스러운 것부터 — 매칭 confidence 낮은 순 (먼저 검증해야 할 것 위에)
      suspiciousFirst: true,
    }),
    [onlyActive],
  );

  const { data, loading, fetchMore, refetch } = useQuery<
    QueryPendingVerificationsQuery,
    QueryPendingVerificationsQueryVariables
  >(QueryPendingVerifications, { variables, fetchPolicy: 'network-only' });

  const { data: countData } = useQuery<
    QueryPendingVerificationsTotalCountQuery,
    QueryPendingVerificationsTotalCountQueryVariables
  >(QueryPendingVerificationsTotalCount, {
    variables: { aiSuggestion: ProductMappingAiSuggestion.Reject, onlyActive },
    fetchPolicy: 'network-only',
  });

  const [verifyMutation] = useVerifyProductMapping();

  const items = data?.pendingVerifications ?? [];
  const lastSearchAfter = items.length ? items[items.length - 1].searchAfter : null;

  const decide = useCallback(
    async (id: string, result: ProductMappingVerificationStatus) => {
      await verifyMutation({
        variables: { productMappingId: parseInt(id), result },
      });
      setDecided((prev) => ({
        ...prev,
        [id]: result === ProductMappingVerificationStatus.Verified ? 'approved' : 'rejected',
      }));
    },
    [verifyMutation],
  );

  const loadMore = useCallback(() => {
    if (!lastSearchAfter) return;
    fetchMore({
      variables: { ...variables, searchAfter: lastSearchAfter },
      updateQuery: (prev, { fetchMoreResult }) => ({
        pendingVerifications: [
          ...(prev.pendingVerifications ?? []),
          ...(fetchMoreResult.pendingVerifications ?? []),
        ],
      }),
    });
  }, [fetchMore, lastSearchAfter, variables]);

  return (
    <div className="space-y-3">
      {/* 툴바 */}
      <div className="flex items-center justify-between rounded-lg border border-stroke bg-white px-4 py-2.5 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-black dark:text-white">
            🤖 거절추천 큐
            {countData?.pendingVerificationsTotalCount != null && (
              <span className="ml-2 rounded bg-danger/10 px-1.5 py-0.5 text-xs font-bold text-danger">
                {countData.pendingVerificationsTotalCount.toLocaleString()}건
              </span>
            )}
          </span>
          <span className="text-gray-400 text-xs">
            사전분류(26b)가 오매칭으로 의심한 것만 — 근거 확인 후 확정
          </span>
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-black dark:text-white">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
          />
          활성 딜만
        </label>
      </div>

      {/* 리스트 */}
      {loading && items.length === 0 ? (
        <div className="text-gray-400 py-10 text-center text-sm">불러오는 중…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400 py-10 text-center text-sm">
          거절추천 매핑이 없습니다. (사전분류 배치가 매일 새벽 02:00 갱신)
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const state = decided[item.id];
            return (
              <div
                key={item.id}
                className={`rounded-lg border p-3 transition-opacity ${
                  state
                    ? 'border-stroke opacity-40 dark:border-strokedark'
                    : 'border-danger/30 bg-white dark:bg-boxdark'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* 핫딜 제목 ↔ 카탈로그 나란히 */}
                    <div className="truncate text-sm font-medium text-black dark:text-white">
                      {item.product?.url ? (
                        <a
                          href={item.product.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {item.product?.title ?? '(제목 없음)'}
                        </a>
                      ) : (
                        (item.product?.title ?? '(제목 없음)')
                      )}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 truncate text-xs">
                      ↔{' '}
                      {item.danawaUrl ? (
                        <a
                          href={item.danawaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {item.brandProduct}
                        </a>
                      ) : (
                        item.brandProduct
                      )}
                    </div>
                    {/* 26b 근거 — 판단이 한 시선에 끝나게 인라인 노출 */}
                    <div className="rounded bg-danger/5 px-2 py-1 text-xs text-danger">
                      {stripMarker(item.aiSuggestionReason) || 'AI 거절 추천'}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    {state ? (
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold ${
                          state === 'rejected' ? 'text-danger' : 'text-success'
                        }`}
                      >
                        {state === 'rejected' ? '거절됨' : '승인됨'}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => decide(item.id, ProductMappingVerificationStatus.Rejected)}
                          className="rounded bg-danger px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                        >
                          오매칭 확정
                        </button>
                        <button
                          onClick={() => decide(item.id, ProductMappingVerificationStatus.Verified)}
                          className="rounded border border-success px-3 py-1.5 text-xs font-bold text-success hover:bg-success/10"
                        >
                          정상 매칭
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-center gap-2 py-2">
            {lastSearchAfter && (
              <button
                onClick={loadMore}
                className="rounded border border-stroke px-4 py-1.5 text-xs dark:border-strokedark dark:text-white"
              >
                더 불러오기
              </button>
            )}
            <button
              onClick={() => {
                setDecided({});
                refetch();
              }}
              className="text-gray-500 rounded border border-stroke px-4 py-1.5 text-xs dark:border-strokedark"
            >
              새로고침
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
