'use client';

import { useMemo, useState } from 'react';

import { ProductMappingVerificationStatus } from '@/generated/gql/graphql';
import { useGetGatedMappings } from '@/hooks/graphql/gated-mappings';
import { useVerifyProductMapping } from '@/hooks/graphql/verification';

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
  const [message, setMessage] = useState<string | null>(null);
  // 낙관적 처리 표시 (id → 처리 결과). GraphQL id 는 string(ID).
  const [handled, setHandled] = useState<Record<string, 'verified' | 'rejected'>>({});

  const { data, loading, error, refetch } = useGetGatedMappings({
    matchingSource: activeSources.length > 0 ? activeSources : undefined,
    productTitle: appliedTitle || undefined,
    limit: 50,
  });

  const [verifyMapping] = useVerifyProductMapping();

  const items = useMemo(() => data?.gatedMappings ?? [], [data]);

  const toggleSource = (value: string) => {
    setActiveSources((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleVerify = async (id: string, result: ProductMappingVerificationStatus) => {
    try {
      await verifyMapping({
        variables: { productMappingId: Number(id), result },
      });
      setHandled((prev) => ({
        ...prev,
        [id]: result === ProductMappingVerificationStatus.Verified ? 'verified' : 'rejected',
      }));
      setMessage(
        result === ProductMappingVerificationStatus.Verified
          ? '승인 처리했습니다 (게이트 오판 → 재매칭 대상).'
          : '거절 유지했습니다 (추출 오염 확정).',
      );
    } catch (e) {
      setMessage(`처리 실패: ${(e as Error).message}`);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
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
                  : 'text-gray-500 dark:text-gray-400 border border-stroke dark:border-strokedark'
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
        <span className="text-gray-400 text-xs">{items.length}건</span>
      </div>

      {message && (
        <div className="bg-gray-100 text-gray-700 dark:text-gray-200 mb-3 rounded-md px-3 py-2 text-xs dark:bg-meta-4">
          {message}
        </div>
      )}

      {loading && <div className="text-gray-400 py-10 text-center text-sm">불러오는 중…</div>}
      {error && (
        <div className="py-10 text-center text-sm text-meta-1">조회 실패: {error.message}</div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="text-gray-400 py-10 text-center text-sm">차단된 매핑이 없습니다.</div>
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
                    <span className="text-gray-400 text-[11px]">{item.product.provider.name}</span>
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
                <div className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
                  추출 → brand: <b className="text-meta-1">{brand ?? '∅'}</b> / model:{' '}
                  <b className="text-meta-1">{modelName ?? '∅'}</b>
                </div>

                {reason && (
                  <div className="text-gray-400 mt-0.5 truncate text-[11px]" title={reason}>
                    {reason}
                  </div>
                )}
              </div>

              {/* 액션 */}
              <div className="flex flex-shrink-0 flex-col justify-center gap-2">
                {done ? (
                  <span className="text-gray-400 text-xs">
                    {done === 'verified' ? '승인됨' : '거절됨'}
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        handleVerify(item.id, ProductMappingVerificationStatus.Rejected)
                      }
                      className="rounded-md bg-meta-1 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                    >
                      거절 유지
                    </button>
                    <button
                      onClick={() =>
                        handleVerify(item.id, ProductMappingVerificationStatus.Verified)
                      }
                      className="rounded-md border border-stroke px-3 py-1.5 text-xs font-medium dark:border-strokedark"
                    >
                      승인(오판)
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GatedMappingList;
