'use client';

import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ProductMappingAiSuggestion,
  ProductMappingVerificationStatus,
  QueryPendingVerificationsQuery,
  QueryPendingVerificationsTotalCountQuery,
  QueryPendingVerificationsTotalCountQueryVariables,
} from '@/generated/gql/graphql';
import { QueryPendingVerificationsTotalCount } from '@/graphql/verification';
import {
  useGetPendingVerificationsLazy,
  useVerifyProductMapping,
} from '@/hooks/graphql/verification';

const PAGE_SIZE = 20;
// 한 번 불러올 때 이어 받는 최대 페이지 — 종료 딜만 연달아 나와도 빈 화면에서 멈추지 않게, 하지만 무한히 돌지 않게
const MAX_PAGES_PER_LOAD = 5;

type Item = QueryPendingVerificationsQuery['pendingVerifications'][number];

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

  // 서버 onlyActive 는 limit 으로 자른 '뒤에' 종료 딜을 걸러서(matching-api filterByActiveProduct)
  // 페이지가 짧거나 통째로 비고, 비면 다음 커서까지 사라져 목록이 멈췄다.
  // → 목록은 전체를 받아 커서는 원본 마지막 행에서 잇고, 종료 딜은 여기서 거른다.
  const [fetchPage] = useGetPendingVerificationsLazy();
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState<string[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const load = useCallback(
    async (from: string[] | null) => {
      const request = ++requestRef.current;
      setLoading(true);
      setLoadError(null);
      try {
        let after = from;
        let more = true;
        const collected: Item[] = [];
        for (
          let page = 0;
          page < MAX_PAGES_PER_LOAD && more && collected.length < PAGE_SIZE;
          page++
        ) {
          const result = await fetchPage({
            variables: {
              limit: PAGE_SIZE,
              searchAfter: after ?? undefined,
              aiSuggestion: ProductMappingAiSuggestion.Reject,
              // 의심스러운 것부터 — 매칭 confidence 낮은 순. 이때 서버는 orderBy 를 안 본다
              suspiciousFirst: true,
            },
          });
          if (request !== requestRef.current) return;
          if (result.error) throw result.error;
          const rows = result.data?.pendingVerifications ?? [];
          // 서버 onlyActive 와 같은 기준: 상품이 있고 종료되지 않은 것
          collected.push(
            ...(onlyActive ? rows.filter((r) => r.product && !r.product.isEnd) : rows),
          );
          const last = rows.at(-1)?.searchAfter;
          if (last) after = [...last];
          more = rows.length >= PAGE_SIZE && !!last;
        }
        setItems((prev) => (from ? [...prev, ...collected] : collected));
        setCursor(after);
        setHasMore(more);
      } catch (error) {
        if (request !== requestRef.current) return;
        setLoadError((error as Error).message);
      } finally {
        if (request === requestRef.current) setLoading(false);
      }
    },
    [fetchPage, onlyActive],
  );

  useEffect(() => {
    setItems([]);
    load(null);
  }, [load]);

  const { data: countData } = useQuery<
    QueryPendingVerificationsTotalCountQuery,
    QueryPendingVerificationsTotalCountQueryVariables
  >(QueryPendingVerificationsTotalCount, {
    variables: {
      aiSuggestion: ProductMappingAiSuggestion.Reject,
      onlyActive,
      // items 쿼리와 동일 모집단을 세야 한다 — 없으면 confidence NULL 행이 count 에만 섞여
      // "개수는 나오는데 목록은 비어있음" 이 재현된다.
      suspiciousFirst: true,
    },
    fetchPolicy: 'network-only',
  });

  const [verifyMutation] = useVerifyProductMapping();

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
    if (cursor) load(cursor);
  }, [cursor, load]);

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
          <span className="text-xs text-gray-400">
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
      {loadError && (
        <div className="rounded border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger">
          불러오기 실패: {loadError}
        </div>
      )}
      {loading && items.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">불러오는 중…</div>
      ) : items.length === 0 && !hasMore ? (
        <div className="py-10 text-center text-sm text-gray-400">
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
                    <div className="truncate text-xs text-gray-500 dark:text-gray-400">
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
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="rounded border border-stroke px-4 py-1.5 text-xs disabled:opacity-50 dark:border-strokedark dark:text-white"
              >
                {loading ? '불러오는 중…' : '더 불러오기'}
              </button>
            )}
            <button
              onClick={() => {
                setDecided({});
                load(null);
              }}
              className="rounded border border-stroke px-4 py-1.5 text-xs text-gray-500 dark:border-strokedark"
            >
              새로고침
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
