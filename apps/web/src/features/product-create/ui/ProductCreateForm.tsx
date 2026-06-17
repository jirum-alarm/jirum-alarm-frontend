'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import Button from '@/shared/ui/common/Button';
import Input from '@/shared/ui/common/Input';

import { CategoryQueries } from '@/entities/category';

import useProductCreateForm from '../model/useProductCreateForm';

export default function ProductCreateForm() {
  const {
    title,
    setTitle,
    url,
    setUrl,
    urlError,
    price,
    setPrice,
    thumbnail,
    setThumbnail,
    thumbnailError,
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

  // 숫자 상태를 천 단위 콤마로 표시 (입력은 모델 훅이 숫자만 남김).
  const priceDisplay = price ? Number(price).toLocaleString() : '';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) submit();
      }}
      className="flex flex-col gap-5"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="상품명을 입력해 주세요"
        maxLength={255}
      />

      <Input
        type="url"
        inputMode="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="구매 링크(URL)를 입력해 주세요"
        maxLength={2048}
        error={urlError}
        helperText={
          urlError
            ? '올바른 링크가 아니에요. http:// 또는 https:// 로 시작하는 주소여야 해요.'
            : 'http:// 또는 https:// 로 시작하는 구매 페이지 주소를 입력해 주세요.'
        }
      />

      <select
        value={categoryId ?? ''}
        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
        className="w-full border-b border-gray-100 bg-white pb-3 text-base text-gray-900 outline-none"
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

      <Input
        inputMode="numeric"
        value={priceDisplay}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="가격 (선택, 원)"
        helperText="숫자만 입력하면 원화로 표시됩니다."
      />

      <Input
        type="url"
        inputMode="url"
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
        placeholder="썸네일 이미지 URL (선택)"
        maxLength={2048}
        error={thumbnailError}
        helperText={
          thumbnailError
            ? '올바른 이미지 링크가 아니에요. http:// 또는 https:// 로 시작해야 해요.'
            : '이미지 주소가 있으면 입력해 주세요. (선택)'
        }
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="상품 설명을 입력해 주세요 (선택)"
        className="min-h-[160px] resize-none text-sm leading-relaxed text-gray-900 placeholder-gray-400 outline-none"
        maxLength={5000}
      />

      <Button type="submit" disabled={!canSubmit} className="mt-2 w-full">
        {isSubmitting ? '등록 중...' : '핫딜 등록'}
      </Button>
    </form>
  );
}
