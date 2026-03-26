'use client';

import Image from 'next/image';

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
  } = usePostForm(editPostId, initialContent);

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
          value={isEdit ? (existingTitle ?? '') : title}
          onChange={(e) => !isEdit && setTitle(e.target.value)}
          readOnly={isEdit}
          placeholder="제목을 입력해 주세요"
          className="mb-3 w-full border-b border-gray-100 pb-3 text-base font-semibold text-gray-900 placeholder-gray-300 outline-none read-only:text-gray-500"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력해주세요"
          className="min-h-[200px] flex-1 resize-none text-sm leading-relaxed text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>

      {/* 상품 태그 */}
      <div className="border-t border-gray-100 px-5 py-4">
        {isEdit ? (
          existingTaggedProduct ? (
            <div className="flex items-center gap-x-3 rounded-xl bg-gray-50 p-3">
              {existingTaggedProduct.thumbnail && (
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    src={existingTaggedProduct.thumbnail}
                    alt={existingTaggedProduct.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {existingTaggedProduct.title}
                </p>
                {existingTaggedProduct.price && (
                  <p className="mt-0.5 text-xs font-semibold text-gray-700">
                    {existingTaggedProduct.price}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <span className="flex items-center gap-x-2 text-sm text-gray-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-300">
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
          className="bg-primary-500 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {isSubmitting ? '처리 중...' : isEdit ? '수정 완료' : '글 등록하기'}
        </button>
      </div>
    </form>
  );
}
