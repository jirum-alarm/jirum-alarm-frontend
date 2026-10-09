'use client';

import { useState } from 'react';

import Panel from '@/components/Panel';
import { useGetCategories } from '@/hooks/graphql/category';

interface ProductFiltersProps {
  productId: string;
  keyword: string;
  categoryId: number | undefined;
  isEnd: boolean | undefined;
  isHot: boolean | undefined;
  onChangeProductId: (productId: string) => void;
  onChangeKeyword: (keyword: string) => void;
  onChangeCategoryId: (categoryId: number | undefined) => void;
  onChangeIsEnd: (isEnd: boolean | undefined) => void;
  onChangeIsHot: (isHot: boolean | undefined) => void;
  onSearch: () => void;
}

const ProductFilters = ({
  productId,
  keyword,
  categoryId,
  isEnd,
  isHot,
  onChangeProductId,
  onChangeKeyword,
  onChangeCategoryId,
  onChangeIsEnd,
  onChangeIsHot,
  onSearch,
}: ProductFiltersProps) => {
  const { data: categoryData } = useGetCategories();
  const categories = categoryData?.categories ?? [];

  // 검색어 경로(Meili)는 isHot 을 안 보고 isEnd:true 를 '종료 포함'으로 읽는다(product-read.service)
  // → 검색어가 있으면 두 필터를 잠가 화면과 결과가 어긋나지 않게 한다.
  const keywordMode = keyword.trim().length > 0;

  // 폰에선 검색어만 보이고 나머지 조건은 접어 둔다(펼치면 화면 절반을 덮었다)
  const [open, setOpen] = useState(false);
  const more = open ? '' : 'hidden';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter 는 글자 확정용 — 반쯤 조합된 글자로 실행하지 않는다
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      onSearch();
    }
  };

  return (
    <Panel className="mb-6 px-4 py-4 sm:px-7.5">
      <div className="flex flex-wrap items-end gap-3 sm:gap-4">
        <div className={`${more} w-full sm:block sm:w-32`}>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            상품 ID
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="ID"
            value={productId}
            onChange={(e) => onChangeProductId(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="w-full sm:w-auto sm:flex-1">
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            검색어
          </label>
          <input
            type="text"
            placeholder="상품명 검색"
            value={keyword}
            onChange={(e) => onChangeKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={productId.length > 0}
            maxLength={100}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className={`${more} w-full sm:block sm:w-40`}>
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

        <div className={`${more} min-w-0 flex-1 sm:block sm:w-32 sm:flex-none`}>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">핫딜</label>
          <select
            value={isHot === undefined ? '' : isHot ? 'true' : 'false'}
            onChange={(e) =>
              onChangeIsHot(e.target.value === '' ? undefined : e.target.value === 'true')
            }
            disabled={keywordMode}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">전체</option>
            <option value="true">핫딜</option>
            <option value="false">일반</option>
          </select>
        </div>

        <div className={`${more} min-w-0 flex-1 sm:block sm:w-32 sm:flex-none`}>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">상태</label>
          <select
            value={isEnd === undefined ? '' : isEnd ? 'true' : 'false'}
            onChange={(e) =>
              onChangeIsEnd(e.target.value === '' ? undefined : e.target.value === 'true')
            }
            disabled={keywordMode}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">전체</option>
            <option value="false">판매중</option>
            <option value="true">종료</option>
          </select>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex-1 rounded-lg border border-stroke px-4 py-2.5 text-sm font-medium text-body dark:border-strokedark sm:hidden"
          >
            {open ? '필터 접기' : '상세 필터'}
          </button>
          <button
            onClick={onSearch}
            className="flex-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90 sm:w-auto sm:flex-none sm:py-2"
          >
            검색
          </button>
        </div>
      </div>
      {keywordMode && (
        <p className="mt-2 text-xs text-bodydark2">
          검색어 검색은 핫딜·상태 필터가 적용되지 않고 판매중 상품만 보여줍니다.
        </p>
      )}
    </Panel>
  );
};

export default ProductFilters;
