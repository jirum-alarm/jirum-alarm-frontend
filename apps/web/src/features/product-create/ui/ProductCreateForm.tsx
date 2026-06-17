'use client';

import { CATEGORIES } from '@/shared/config/categories';
import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/common/Button';
import Input from '@/shared/ui/common/Input';

import useProductCreateForm from '../model/useProductCreateForm';

import ThumbnailUploader from './ThumbnailUploader';

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
    uploadThumbnail,
    isUploadingThumbnail,
    content,
    setContent,
    categoryId,
    setCategoryId,
    submit,
    isSubmitting,
    canSubmit,
  } = useProductCreateForm();

  // 숫자 상태를 천 단위 콤마로 표시 (입력은 모델 훅이 숫자만 남김).
  const priceDisplay = price ? Number(price).toLocaleString() : '';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) submit();
      }}
      className="flex flex-col gap-6"
    >
      <Field label="상품명" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="상품명을 입력해 주세요"
          maxLength={255}
        />
      </Field>

      <Field label="구매 링크" required>
        <Input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="구매 페이지 주소를 붙여넣어 주세요"
          maxLength={2048}
          error={urlError}
          helperText={urlError ? 'http:// 또는 https:// 로 시작해야 해요.' : undefined}
        />
      </Field>

      <Field label="카테고리" required>
        <ul className="grid grid-cols-3 gap-[10px]">
          {CATEGORIES.map((category) => {
            const selected = categoryId === category.value;
            const Icon = selected ? category.iconComponent : category.offIconComponent;
            return (
              <li key={category.value}>
                <button
                  type="button"
                  onClick={() => setCategoryId(category.value)}
                  aria-pressed={selected}
                  className={cn(
                    'mouse-hover:hover:border-primary-500 inline-flex h-22 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-gray-300',
                    {
                      'border-primary-500 bg-primary-50': selected,
                    },
                  )}
                >
                  <Icon width={36} height={36} />
                  <span className={cn('text-sm text-gray-700', { 'text-primary-700': selected })}>
                    {category.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Field>

      <Field label="가격">
        <Input
          inputMode="numeric"
          value={priceDisplay}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="가격을 입력해 주세요 (원)"
        />
      </Field>

      <Field label="썸네일 이미지">
        <ThumbnailUploader
          thumbnail={thumbnail}
          isUploading={isUploadingThumbnail}
          onUpload={uploadThumbnail}
          onRemove={() => setThumbnail('')}
        />
      </Field>

      <Field label="상품 설명">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="상품에 대한 설명을 자유롭게 적어 주세요"
          className="min-h-[160px] w-full resize-none rounded-lg border border-gray-300 p-3 text-sm leading-relaxed text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900"
          maxLength={5000}
        />
      </Field>

      <Button type="submit" disabled={!canSubmit} className="mt-2 w-full">
        {isSubmitting ? '등록 중...' : '핫딜 등록'}
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-error-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
