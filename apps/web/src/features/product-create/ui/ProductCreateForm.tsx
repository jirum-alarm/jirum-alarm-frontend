'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import Button from '@/shared/ui/common/Button';

import { CategoryQueries } from '@/entities/category';

import useProductCreateForm from '../model/useProductCreateForm';

const inputClassName =
  'w-full border-b border-gray-100 pb-3 text-base text-gray-900 placeholder-gray-300 outline-none';

export default function ProductCreateForm() {
  const {
    title,
    setTitle,
    url,
    setUrl,
    price,
    setPrice,
    thumbnail,
    setThumbnail,
    content,
    setContent,
    categoryId,
    setCategoryId,
    submit,
    isSubmitting,
    canSubmit,
  } = useProductCreateForm();

  const { data } = useSuspenseQuery(CategoryQueries.categories());
  const categories = data.categories;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) submit();
      }}
      className="flex flex-1 flex-col gap-5 px-5 pt-4"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="상품명을 입력해 주세요"
        className={inputClassName}
        maxLength={255}
      />

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="구매 링크(URL)를 입력해 주세요"
        className={inputClassName}
        inputMode="url"
        maxLength={2048}
      />

      <select
        value={categoryId ?? ''}
        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
        className={`${inputClassName} bg-white`}
      >
        <option value="" disabled>
          카테고리를 선택해 주세요
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="가격 (선택)"
        className={inputClassName}
        maxLength={50}
      />

      <input
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
        placeholder="썸네일 이미지 URL (선택)"
        className={inputClassName}
        inputMode="url"
        maxLength={2048}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="상품 설명을 입력해 주세요 (선택)"
        className="min-h-[160px] flex-1 resize-none text-sm leading-relaxed text-gray-900 placeholder-gray-400 outline-none"
        maxLength={5000}
      />

      <Button type="submit" disabled={!canSubmit} className="mt-auto">
        {isSubmitting ? '등록 중...' : '핫딜 등록'}
      </Button>
    </form>
  );
}
