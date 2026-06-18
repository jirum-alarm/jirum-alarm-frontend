'use client';

import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

import usePostForm, { TaggedProduct } from '../model/usePostForm';

import ProductTagModal from './ProductTagModal';

export const POST_FORM_ID = 'community-post-form';

export default function PostForm({
  editPostId,
  initialContent,
  existingTitle,
  existingTaggedProduct,
}: {
  editPostId?: number;
  initialContent?: string;
  existingTitle?: string;
  existingTaggedProduct?: TaggedProduct | null;
}) {
  const {
    title,
    setTitle,
    content,
    setContent,
    taggedProduct,
    setTaggedProduct,
    submitPost,
    isSubmitting,
    canSubmit,
    isEdit,
  } = usePostForm(editPostId, initialContent, existingTitle);

  return (
    <form
      id={POST_FORM_ID}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) submitPost();
      }}
      className="flex flex-1 flex-col"
    >
      <div className="flex flex-1 flex-col px-5 pt-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력해 주세요"
          className="typography-title-16sb border-border-subtle text-fg-primary mb-3 w-full border-b pb-3 placeholder-gray-300 outline-none"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력해주세요"
          className="text-fg-primary typography-body-14r min-h-[200px] flex-1 resize-none leading-relaxed placeholder-gray-400 outline-none"
        />
      </div>

      {/* 상품 태그 */}
      <div className="border-border-subtle border-t px-5 py-4">
        {isEdit ? (
          existingTaggedProduct ? (
            <div className="bg-surface-subtle flex items-center gap-x-3 rounded-xl p-3">
              {existingTaggedProduct.thumbnail && (
                <div className="bg-surface-emphasis relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                  <ProductThumbnail
                    src={existingTaggedProduct.thumbnail}
                    alt={existingTaggedProduct.title}
                    title={existingTaggedProduct.title}
                    type="product"
                    sizes="48px"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="typography-body-14m text-fg-primary truncate">
                  {existingTaggedProduct.title}
                </p>
                {existingTaggedProduct.price && (
                  <p className="text-fg-secondary-strong mt-0.5 text-xs font-semibold">
                    {existingTaggedProduct.price}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <span className="text-fg-disabled typography-body-14r flex items-center gap-x-2">
              <span className="border-border-default text-fg-disabled flex h-6 w-6 items-center justify-center rounded-full border">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 2v8M2 6h8" strokeLinecap="round" />
                </svg>
              </span>
              상품 태그
            </span>
          )
        ) : (
          <ProductTagModal
            selected={taggedProduct}
            onSelect={setTaggedProduct}
            onClear={() => setTaggedProduct(null)}
          />
        )}
      </div>

      {/* 데스크탑 전용 제출 버튼 */}
      <div className="hidden px-5 pb-6 md:block">
        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-surface-brand typography-body-14sb text-fg-inverse w-full rounded-xl py-3.5 transition-opacity disabled:opacity-40"
        >
          {isSubmitting ? '처리 중...' : isEdit ? '수정 완료' : '글 등록하기'}
        </button>
      </div>
    </form>
  );
}
