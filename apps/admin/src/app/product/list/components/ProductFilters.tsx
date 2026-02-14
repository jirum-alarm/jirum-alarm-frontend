'use client';

import { useGetCategories } from '@/hooks/graphql/category';

interface ProductFiltersProps {
  keyword: string;
  categoryId: number | undefined;
  isEnd: boolean | undefined;
  isHot: boolean | undefined;
  onChangeKeyword: (keyword: string) => void;
  onChangeCategoryId: (categoryId: number | undefined) => void;
  onChangeIsEnd: (isEnd: boolean | undefined) => void;
  onChangeIsHot: (isHot: boolean | undefined) => void;
  onSearch: () => void;
}

const ProductFilters = ({
  keyword,
  categoryId,
  isEnd,
  isHot,
  onChangeKeyword,
  onChangeCategoryId,
  onChangeIsEnd,
  onChangeIsHot,
  onSearch,
}: ProductFiltersProps) => {
  const { data: categoryData } = useGetCategories();
  const categories = categoryData?.categories ?? [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-stroke bg-white px-5 py-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            검색어
          </label>
          <input
            type="text"
            placeholder="상품명 검색"
            value={keyword}
            onChange={(e) => onChangeKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="w-40">
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            카테고리
          </label>
          <select
            value={categoryId ?? ''}
            onChange={(e) =>
              onChangeCategoryId(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">전체</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">핫딜</label>
          <select
            value={isHot === undefined ? '' : isHot ? 'true' : 'false'}
            onChange={(e) =>
              onChangeIsHot(e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">전체</option>
            <option value="true">핫딜</option>
            <option value="false">일반</option>
          </select>
        </div>

        <div className="w-32">
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">상태</label>
          <select
            value={isEnd === undefined ? '' : isEnd ? 'true' : 'false'}
            onChange={(e) =>
              onChangeIsEnd(e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">전체</option>
            <option value="false">판매중</option>
            <option value="true">종료</option>
          </select>
        </div>

        <button
          onClick={onSearch}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-opacity-90"
        >
          검색
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
