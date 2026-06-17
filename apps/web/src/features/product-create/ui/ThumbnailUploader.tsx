'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

export default function ThumbnailUploader({
  thumbnail,
  isUploading,
  onUpload,
  onRemove,
}: {
  thumbnail: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onUpload(file);
  };

  // 업로드된 이미지가 있으면 미리보기 + 삭제 버튼.
  if (thumbnail) {
    return (
      <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-gray-300">
        <Image src={thumbnail} alt="썸네일 미리보기" fill className="object-cover" sizes="160px" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
          aria-label="이미지 삭제"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-400',
        {
          'border-primary-500 bg-primary-50': isDragging,
          'cursor-wait': isUploading,
          'mouse-hover:hover:border-primary-500 cursor-pointer': !isUploading,
        },
      )}
    >
      {isUploading ? (
        <span>업로드 중...</span>
      ) : (
        <>
          <span className="text-2xl">📷</span>
          <span>이미지를 끌어다 놓거나 클릭해서 업로드</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </button>
  );
}
