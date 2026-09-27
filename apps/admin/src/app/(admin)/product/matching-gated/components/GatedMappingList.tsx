'use client';

import { useMemo, useState } from 'react';

import Panel from '@/components/Panel';
import { useToast } from '@/components/Toast';
import { ProductMappingVerificationStatus } from '@/generated/gql/graphql';
import { useGetGatedMappings, useRematchGatedMapping } from '@/hooks/graphql/gated-mappings';
import { useVerifyProductMapping } from '@/hooks/graphql/verification';
import { useLoadMoreOnView } from '@/hooks/useLoadMoreOnView';

// 게이트 source 필터 옵션. 백엔드 matchingSource 값과 일치해야 한다.
const SOURCE_OPTIONS = [
  { label: '추출 오염', value: 'reranker:extraction-poisoned' },
  { label: '묶음글', value: 'reranker:bundle-skip' },
] as const;

/** extractedProductInfo(JSON 문자열)에서 brand/modelName 추출. */
function parseExtracted(json?: string | null): { brand: string | null; modelName: string | null } {
  if (!json) return { brand: null, modelName: null };
  try {
    const e = JSON.parse(json);
    return { brand: e.brand ?? null, modelName: e.modelName ?? null };
  } catch {
    return { brand: null, modelName: null };
  }
}

/** matchingReasoning(JSON 배열 문자열)을 사람이 읽을 한 줄로. */
function parseReason(json?: string | null): string {
  if (!json) return '';
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.join(' · ') : String(arr);
  } catch {
    return json;
  }
}

const GatedMappingList = () => {
  const [activeSources, setActiveSources] = useState<string[]>(SOURCE_OPTIONS.map((o) => o.value));
  const [titleQuery, setTitleQuery] = useState('');
  const [appliedTitle, setAppliedTitle] = useState('');
  const toast = useToast();
  // 낙관적 처리 표시 (id → 처리 결과). GraphQL id 는 string(ID).
  const [handled, setHandled] = useState<Record<string, 'rematch' | 'rejected'>>({});

  // limit 은 서버 상한 20(SearchAfterArgs) — 50 을 보내 Bad Request 로 목록이 통째로 안 떴다. 나머지는 스크롤로 이어 받는다
  const { data, loading, error, refetch, fetchMore } = useGetGatedMappings({
    matchingSource: activeSources.length > 0 ? activeSources : undefined,
    productTitle: appliedTitle || undefined,
  });
  const viewRef = useLoadMoreOnView({ field: 'gatedMappings', data, loading, fetchMore });

  const [verifyMapping] = useVerifyProductMapping();
  const [rematchMapping] = useRematchGatedMapping();

  // 서버가 이미 판정된 행을 걸러주지 않아 새로고침하면 처리한 항목이 다시 떴다(서버 제외는 matching-api 에서 따로 진행).
  // 그 전까지 안전망: 판정 끝난 행은 숨긴다. 방금 이 화면에서 처리한 행은 결과 표시를 위해 남긴다
  const items = useMemo(
    () =>
      (data?.gatedMappings ?? []).filter(
        (item) =>
          handled[item.id] ||
          (item.verificationStatus !== ProductMappingVerificationStatus.Verified &&
            item.verificationStatus !== ProductMappingVerificationStatus.Rejected),
      ),
    [data, handled],
  );

  const toggleSource = (value: string) => {
    setActiveSources((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  // 게이트 맞음 = 거절(REJECTED) 기록. 행은 not_matchable 로 남고 다시 매칭되지 않는다
  const handleConfirmGate = async (id: string) => {
    try {
      await verifyMapping({
        variables: {
          productMappingId: Number(id),
          result: ProductMappingVerificationStatus.Rejected,
        },
      });
      setHandled((prev) => ({ ...prev, [id]: 'rejected' }));
      toast.success('게이트 판정을 확정했습니다.');
    } catch (e) {
      toast.error(`처리 실패: ${(e as Error).message}`);
    }
  };

  // 오판 = 게이트 행을 지우고 게이트만 끈 채 1회 재매칭. 예전 "승인"은 오히려 상품을 매칭 불가로 영구 고정했다
  const handleRematch = async (id: string) => {
    try {
      const { data: res } = await rematchMapping({ variables: { productMappingId: Number(id) } });
      const status = res?.rematchGatedMapping.status;
      setHandled((prev) => ({ ...prev, [id]: 'rematch' }));
      if (status === 'requeued')
        toast.success('재매칭을 시작했습니다. 결과는 매칭 검수(대기)에 올라옵니다.');
      else if (status === 'already_mapped')
        toast.info('이미 다른 매핑이 있는 상품이라 게이트 행만 지웠습니다.');
      else toast.error(`재매칭하지 못했습니다 (${status ?? '응답 없음'})`);
    } catch (e) {
      toast.error(`재매칭 실패: ${(e as Error).message}`);
    }
  };

  return (
    <Panel rounded="sm" className="p-4">
      {/* 필터 바 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleSource(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeSources.includes(opt.value)
                  ? 'bg-primary text-white'
                  : 'border border-stroke text-gray-500 dark:border-strokedark dark:text-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedTitle(titleQuery.trim());
          }}
        >
          <input
            value={titleQuery}
            onChange={(e) => setTitleQuery(e.target.value)}
            placeholder="제목 검색"
            // 서버 GatedMappingsArgs.productTitle @MaxLength(100) — 넘기면 목록이 Bad Request 로 통째 실패한다
            maxLength={100}
            className="rounded-md border border-stroke px-3 py-1.5 text-xs dark:border-strokedark dark:bg-boxdark"
          />
          <button
            type="submit"
            className="rounded-md border border-stroke px-3 py-1.5 text-xs dark:border-strokedark"
          >
            검색
          </button>
        </form>
        <button
          onClick={() => refetch()}
          className="rounded-md border border-stroke px-3 py-1.5 text-xs dark:border-strokedark"
        >
          새로고침
        </button>
        <span className="text-xs text-gray-400">{items.length}건</span>
      </div>

      {loading && <div className="py-10 text-center text-sm text-gray-400">불러오는 중…</div>}
      {error && (
        <div className="py-10 text-center text-sm text-meta-1">조회 실패: {error.message}</div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="py-10 text-center text-sm text-gray-400">차단된 매핑이 없습니다.</div>
      )}

      {/* 목록 — title ↔ 추출 대조가 핵심 */}
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const { brand, modelName } = parseExtracted(item.extractedProductInfo);
          const reason = parseReason(item.matchingReasoning);
          const sourceLabel =
            SOURCE_OPTIONS.find((o) => o.value === item.matchingSource)?.label ??
            item.matchingSource;
          const done = handled[item.id];

          return (
            <div
              key={item.id}
              className={`flex gap-4 rounded-md border p-3 ${
                done
                  ? 'border-stroke opacity-50 dark:border-strokedark'
                  : 'border-stroke dark:border-strokedark'
              }`}
            >
              {item.product?.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.thumbnail}
                  alt=""
                  className="h-16 w-16 flex-shrink-0 rounded object-cover"
                />
              )}

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-meta-4 px-1.5 py-0.5 text-[10px] text-white">
                    {sourceLabel}
                  </span>
                  {item.product?.provider?.name && (
                    <span className="text-[11px] text-gray-400">{item.product.provider.name}</span>
                  )}
                  {item.product?.url && (
                    <a
                      href={item.product.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline"
                    >
                      원문 ↗
                    </a>
                  )}
                </div>

                {/* 원본 제목 */}
                <div className="text-sm font-medium text-black dark:text-white">
                  {item.product?.title ?? '(제목 없음)'}
                </div>

                {/* 추출 결과 — 제목과 대조해 오염 판단 */}
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  추출 → brand: <b className="text-meta-1">{brand ?? '∅'}</b> / model:{' '}
                  <b className="text-meta-1">{modelName ?? '∅'}</b>
                </div>

                {reason && (
                  <div className="mt-0.5 truncate text-[11px] text-gray-400" title={reason}>
                    {reason}
                  </div>
                )}
              </div>

              {/* 액션 */}
              <div className="flex flex-shrink-0 flex-col justify-center gap-2">
                {done ? (
                  <span className="text-xs text-gray-400">
                    {done === 'rematch' ? '재매칭 요청됨' : '게이트 확정'}
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => handleConfirmGate(item.id)}
                      className="rounded-md bg-meta-1 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                    >
                      게이트 맞음
                    </button>
                    <button
                      onClick={() => handleRematch(item.id)}
                      className="rounded-md border border-stroke px-3 py-1.5 text-xs font-medium dark:border-strokedark"
                    >
                      오판 → 재매칭
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div ref={viewRef} className="h-4" />
    </Panel>
  );
};

export default GatedMappingList;
