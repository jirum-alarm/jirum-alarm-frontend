'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { cn } from '@/shared/lib/cn';

import { MAX_POST_IMAGES } from '../lib/postContent';

export default function PostImageUploader({
  images,
  isUploading,
  onUpload,
  onRemove,
}: {
  images: string[];
  isUploading: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAddMore = images.length < MAX_POST_IMAGES && !isUploading;

  return (
    <div className="border-t border-gray-100 px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">사진</span>
        <span className="text-xs text-gray-400">
          {images.length}/{MAX_POST_IMAGES}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
          >
            <Image
              src={src}
              alt={`첨부 이미지 ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white"
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              ✕
            </button>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400',
              'transition-colors hover:border-gray-400 hover:text-gray-500',
            )}
            aria-label="이미지 추가"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[10px]">추가</span>
          </button>
        )}

        {isUploading && (
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-400">
            업로드 중
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          onUpload(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
