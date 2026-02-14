'use client';

import { useEffect, useRef } from 'react';

interface ImageCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  danawaImage: string;
  danawaTitle: string;
  /** 다나와 상품 페이지 URL (#1 개선) */
  danawaUrl?: string;
  communityImage?: string;
  communityTitle: string;
}

const ImageCompareModal = ({
  isOpen,
  onClose,
  danawaImage,
  danawaTitle,
  danawaUrl,
  communityImage,
  communityTitle,
}: ImageCompareModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasDanawaImage = danawaImage && danawaImage.length > 0;

  return (
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={modalRef} className="relative mx-4 w-full max-w-5xl animate-[fadeIn_0.2s_ease-out]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-2 text-white/70 transition-colors hover:text-white"
        >
          <span className="text-sm">ESC로 닫기</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Comparison */}
        <div className="grid grid-cols-2 gap-6">
          {/* Danawa Product */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-boxdark">
            <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                <span className="text-sm font-bold uppercase tracking-wide text-white">
                  다나와 상품
                </span>
              </div>
            </div>
            <div className="flex aspect-square items-center justify-center bg-white p-4">
              {hasDanawaImage ? (
                <img
                  src={danawaImage}
                  alt={danawaTitle}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              ) : (
                /* #1 개선: 다나와 이미지가 없을 때 상품 정보 + 다나와 링크 표시 */
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-10 w-10 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-black dark:text-white">
                      {danawaTitle}
                    </p>
                    <p className="text-gray-400 text-xs">다나와 이미지를 불러올 수 없습니다</p>
                  </div>
                  {danawaUrl && (
                    <a
                      href={danawaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      다나와에서 확인하기
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="bg-gray-50 flex items-center justify-between px-4 py-3 dark:bg-meta-4">
              <p className="truncate text-sm font-medium text-black dark:text-white">
                {danawaTitle}
              </p>
              {danawaUrl && hasDanawaImage && (
                <a
                  href={danawaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 flex-shrink-0 text-xs text-primary hover:underline"
                >
                  다나와 보기 →
                </a>
              )}
            </div>
          </div>

          {/* Community Post */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-boxdark">
            <div className="bg-gradient-to-r from-success to-success/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                <span className="text-sm font-bold uppercase tracking-wide text-white">
                  커뮤니티 게시물
                </span>
              </div>
            </div>
            <div className="flex aspect-square items-center justify-center bg-white p-4">
              {communityImage ? (
                <img
                  src={communityImage}
                  alt={communityTitle}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center justify-center">
                  <svg
                    className="mb-2 h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">이미지 없음</span>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-4 py-3 dark:bg-meta-4">
              <p className="truncate text-sm font-medium text-black dark:text-white">
                {communityTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-white/50">
            <span className="rounded bg-white/10 px-2 py-1">Space</span>
            선택/해제
            <span className="mx-2">|</span>
            <span className="rounded bg-white/10 px-2 py-1">Enter</span>
            확정
            <span className="mx-2">|</span>
            <span className="rounded bg-white/10 px-2 py-1">ESC</span>
            닫기
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageCompareModal;
