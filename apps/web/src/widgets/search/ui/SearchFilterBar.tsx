'use client';

import { useQuery } from '@tanstack/react-query';

import { cn } from '@/shared/lib/cn';

import { CategoryQueries } from '@/entities/category';
import { ProviderQueries } from '@/entities/provider';

import { SEARCH_PERIODS, SEARCH_SORTS, SearchFiltersController } from '../hooks/useSearchFilters';

const SORT_LABELS: Record<(typeof SEARCH_SORTS)[number], string> = {
  recent: '최신순',
  comments: '댓글 많은 순',
  relevance: '정확도순',
};

const PERIOD_LABELS: Record<(typeof SEARCH_PERIODS)[number], string> = {
  all: '전체 기간',
  '1d': '오늘',
  '7d': '이번주',
  '30d': '한달',
};

/** 필터 행 그룹 라벨 — 어떤 칩 줄이 어떤 필터인지 구분(전부 '전체'로 시작해 라벨 없인 식별 불가). */
function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-11 shrink-0 text-xs text-gray-400">{label}</span>
      <div className="scrollbar-hide pc:mr-0 pc:pr-0 -mr-5 flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-0.5 pr-5">
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      // ponytail: after 유사요소로 세로 히트영역만 확장(~42px) — 가로 확장은 이웃 칩과 겹쳐 오터치 유발
      className={cn(
        'relative shrink-0 cursor-pointer rounded-[40px] border px-3 py-1.5 text-sm transition-all after:absolute after:-inset-y-1 after:right-0 after:left-0 after:content-[""]',
        active
          ? 'border-secondary-500 bg-secondary-50 text-secondary-800 font-semibold'
          : 'border-gray-300 bg-white text-gray-700',
      )}
    >
      {children}
    </button>
  );
}

export default function SearchFilterBar({ controller }: { controller: SearchFiltersController }) {
  const { filters, setFilters, resetFilters, hasActiveFilters } = controller;
  const { data: categoryData } = useQuery(CategoryQueries.categories());
  const { data: providerData } = useQuery(ProviderQueries.communityProviders());

  const categories = categoryData?.categories ?? [];
  const providers = providerData?.communityProviders ?? [];

  return (
    <div className="pc:px-0 flex flex-col gap-2 px-5 pb-3">
      <div className="flex items-center justify-between">
        {/* 정렬은 필터(칩)와 다른 시각 어휘(텍스트 토글) — 모드 선택임을 구분 */}
        <div className="flex items-center gap-2.5">
          {SEARCH_SORTS.map((sort, i) => (
            <div key={sort} className="flex items-center gap-2.5">
              {i > 0 && <span className="h-3 w-px bg-gray-200" />}
              <button
                type="button"
                aria-pressed={filters.sort === sort}
                onClick={() => setFilters({ sort })}
                className={cn(
                  'relative py-2 text-sm transition-colors',
                  filters.sort === sort ? 'font-semibold text-gray-900' : 'text-gray-400',
                )}
              >
                {SORT_LABELS[sort]}
              </button>
            </div>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="py-2 text-sm text-gray-500 underline underline-offset-2"
            >
              초기화
            </button>
          )}
          <label className="flex cursor-pointer items-center gap-1.5 py-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={filters.ended}
              onChange={(e) => setFilters({ ended: e.target.checked || null })}
              className="accent-secondary-500 h-4 w-4"
            />
            품절 포함
          </label>
        </div>
      </div>

      {categories.length > 0 && (
        <FilterRow label="카테고리">
          <Chip active={filters.categoryId === 0} onClick={() => setFilters({ categoryId: null })}>
            전체
          </Chip>
          {categories.map((category) => {
            const id = Number(category.id);
            return (
              <Chip
                key={id}
                active={filters.categoryId === id}
                onClick={() => setFilters({ categoryId: id })}
              >
                {category.name}
              </Chip>
            );
          })}
        </FilterRow>
      )}

      {providers.length > 0 && (
        <FilterRow label="출처">
          <Chip active={filters.providerId === 0} onClick={() => setFilters({ providerId: null })}>
            전체
          </Chip>
          {providers.map((provider) => {
            const id = Number(provider.id);
            return (
              <Chip
                key={id}
                active={filters.providerId === id}
                onClick={() => setFilters({ providerId: id })}
              >
                {provider.nameKr}
              </Chip>
            );
          })}
        </FilterRow>
      )}

      <FilterRow label="기간">
        {SEARCH_PERIODS.map((period) => (
          <Chip
            key={period}
            active={filters.period === period}
            onClick={() => setFilters({ period: period === 'all' ? null : period })}
          >
            {PERIOD_LABELS[period]}
          </Chip>
        ))}
      </FilterRow>
    </div>
  );
}
