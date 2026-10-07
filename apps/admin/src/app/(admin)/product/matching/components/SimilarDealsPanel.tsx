'use client';

import { useEffect, useState } from 'react';

import {
  BrandProduct,
  SimilarProductByTitle,
  useAddProductMapping,
  useGetSimilarProductsByTitleLazy,
} from '@/hooks/graphql/brandProduct';

interface SimilarDealsPanelProps {
  brandProduct: BrandProduct;
  /** 이 상품에 이미 붙은 딜 제목들 — 검색어 칩. 커뮤니티 어휘라 카탈로그명보다 잘 걸린다(2026-09-27 실측) */
  seedTitles: string[];
  /** 우측 목록에 이미 있는 딜(pending 포함) — 후보에서 뺀다 */
  listedProductIds: Set<number>;
  onMapped: (count: number) => void;
}

const SIMILAR_LIMIT = 20; // 서버 상한 20

/**
 * 유사 딜로 형제 매핑 넓히기.
 * 검색어는 사람이 고친다 — 딜 원본 제목은 가격·괄호가 붙으면 결과가 1~2건으로 붕괴하고, 정규식 정리로도 안 살아난다.
 * 수량이 다른 같은 라인(16입 vs 24개)이 섞여 나오므로 헤더의 용량·수량과 눈으로 대조해야 한다.
 */
const SimilarDealsPanel = ({
  brandProduct,
  seedTitles,
  listedProductIds,
  onMapped,
}: SimilarDealsPanelProps) => {
  const catalogName = `${brandProduct.brandName} ${brandProduct.productName}`.trim();
  const [query, setQuery] = useState(catalogName);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [isMapping, setIsMapping] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [search, { data, loading, error }] = useGetSimilarProductsByTitleLazy();
  const [addMapping] = useAddProductMapping();

  const runSearch = (title: string) => {
    const t = title.trim();
    if (!t) return;
    setQuery(t);
    setChecked(new Set());
    search({ variables: { title: t, limit: SIMILAR_LIMIT } });
  };

  useEffect(() => {
    runSearch(catalogName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandProduct.id]);

  const targetId = Number(brandProduct.id);
  const results = (data?.similarProductsByTitle ?? []).filter(
    (p) => p.productMapping?.targetId !== targetId && !listedProductIds.has(Number(p.id)),
  );
  const isMappedElsewhere = (p: SimilarProductByTitle) => p.productMapping?.targetId != null;

  const toggle = (id: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleMap = async () => {
    setIsMapping(true);
    setMapError(null);
    const ids = [...checked];
    const settled = await Promise.allSettled(
      ids.map((productId) => addMapping({ variables: { productId, brandProductId: targetId } })),
    );
    const failed = settled.filter((r) => r.status === 'rejected').length;
    setIsMapping(false);
    if (failed > 0) setMapError(`${ids.length}건 중 ${failed}건 실패`);
    const ok = ids.length - failed;
    if (ok > 0) {
      onMapped(ok);
      runSearch(query);
    }
  };

  const chips = [...new Set(seedTitles)].slice(0, 5);

  return (
    <div className="border-b border-stroke bg-gray-50 px-3 py-2 dark:border-strokedark dark:bg-meta-4/30">
      <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
        <span className="font-bold text-black dark:text-white">유사 딜로 매핑</span>
        <span className="rounded bg-warning/10 px-1.5 py-0.5 font-bold text-warning">
          용량 {brandProduct.volume || '-'} · 수량 {brandProduct.amount || '-'}
        </span>
        <span className="text-gray-500">수량이 다른 딜은 다른 상품입니다</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="mb-1.5 flex gap-1"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 rounded border border-stroke bg-white px-2 py-1 text-xs dark:border-strokedark dark:bg-boxdark"
          placeholder="검색어 (브랜드 + 모델 + 수량이 잘 걸립니다)"
        />
        <button
          type="submit"
          className="shrink-0 rounded bg-primary px-3 py-1.5 text-xs text-white sm:px-2 sm:py-1"
        >
          검색
        </button>
      </form>

      {chips.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {chips.map((t) => (
            <button
              key={t}
              onClick={() => runSearch(t)}
              className="line-clamp-1 max-w-[240px] rounded-full border border-stroke bg-white px-2 py-1 text-left text-[10px] text-gray-600 hover:border-primary dark:border-strokedark dark:bg-boxdark dark:text-gray-300 sm:py-0.5"
              title={t}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-72 space-y-0.5 overflow-y-auto">
        {loading && <p className="py-2 text-xs text-gray-500">검색 중...</p>}
        {error && <p className="py-2 text-xs text-danger">검색 실패: {error.message}</p>}
        {!loading && !error && data && results.length === 0 && (
          <p className="py-2 text-xs text-gray-500">
            새 후보가 없습니다 — 검색어를 짧게(브랜드 + 모델 + 수량) 바꿔보세요
          </p>
        )}
        {results.map((p) => {
          const id = Number(p.id);
          const elsewhere = isMappedElsewhere(p);
          return (
            <label
              key={p.id}
              className={`flex items-center gap-2 rounded px-1 py-1.5 text-xs sm:py-0.5 ${
                elsewhere ? 'opacity-50' : 'cursor-pointer hover:bg-white dark:hover:bg-boxdark'
              }`}
            >
              <input
                type="checkbox"
                disabled={elsewhere}
                checked={checked.has(id)}
                onChange={() => toggle(id)}
                className="h-3.5 w-3.5"
              />
              <span className="w-8 shrink-0 text-right text-[10px] text-gray-400">
                {p.similarity != null ? p.similarity.toFixed(2) : '-'}
              </span>
              <span className="line-clamp-1 min-w-0 flex-1 text-black dark:text-white">
                {p.title}
              </span>
              {p.price && <span className="text-[10px] font-bold text-primary">{p.price}</span>}
              {elsewhere ? (
                <span className="text-[10px] text-gray-500">
                  다른 상품 #{p.productMapping?.targetId}
                </span>
              ) : (
                <a
                  href={p.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  원문
                </a>
              )}
            </label>
          );
        })}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-end gap-2">
        {mapError && <span className="text-[11px] text-danger">{mapError}</span>}
        <button
          onClick={handleMap}
          disabled={checked.size === 0 || isMapping}
          className="rounded bg-success px-2.5 py-2 text-xs font-bold text-white disabled:opacity-40 sm:py-1"
        >
          {isMapping ? '매핑 중...' : `선택 ${checked.size}건 매핑 (승인완료로)`}
        </button>
      </div>
    </div>
  );
};

export default SimilarDealsPanel;
