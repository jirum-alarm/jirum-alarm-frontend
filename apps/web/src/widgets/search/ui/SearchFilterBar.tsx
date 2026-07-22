'use client';

import { useQuery } from '@tanstack/react-query';

import { cn } from '@/shared/lib/cn';

import { CategoryQueries } from '@/entities/category';
import { ProviderQueries } from '@/entities/provider';

import { SEARCH_SORTS, useSearchFilters } from '../hooks/useSearchFilters';

const SORT_LABELS: Record<(typeof SEARCH_SORTS)[number], string> = {
  recent: '최신순',
  relevance: '정확도순',
};

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
      onClick={onClick}
      className={cn(
        'shrink-0 cursor-pointer rounded-[40px] border px-3 py-[5px] text-sm transition-all',
        active
          ? 'border-secondary-500 bg-secondary-50 text-secondary-800 font-semibold'
          : 'border-gray-300 bg-white text-gray-700',
      )}
    >
      {children}
    </button>
  );
}

export default function SearchFilterBar() {
  const { filters, setFilters } = useSearchFilters();
  const { data: categoryData } = useQuery(CategoryQueries.categories());
  const { data: providerData } = useQuery(ProviderQueries.communityProviders());

  const categories = categoryData?.categories ?? [];
  const providers = providerData?.communityProviders ?? [];

  return (
    <div className="pc:px-0 flex flex-col gap-2 px-5 pb-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {SEARCH_SORTS.map((sort) => (
            <Chip key={sort} active={filters.sort === sort} onClick={() => setFilters({ sort })}>
              {SORT_LABELS[sort]}
            </Chip>
          ))}
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-sm text-gray-500">
          <input
            type="checkbox"
            checked={filters.ended}
            onChange={(e) => setFilters({ ended: e.target.checked || null })}
            className="accent-secondary-500 h-4 w-4"
          />
          품절 포함
        </label>
      </div>

      {categories.length > 0 && (
        <div className="scrollbar-hide pc:mx-0 pc:px-0 -mx-5 flex gap-1.5 overflow-x-auto px-5">
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
        </div>
      )}

      {providers.length > 0 && (
        <div className="scrollbar-hide pc:mx-0 pc:px-0 -mx-5 flex gap-1.5 overflow-x-auto px-5">
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
        </div>
      )}
    </div>
  );
}
