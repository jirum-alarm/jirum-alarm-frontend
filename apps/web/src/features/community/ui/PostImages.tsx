'use client';

import Image from 'next/image';

export default function PostImages({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative mx-5 mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={images[0]}
          alt="게시글 이미지"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 640px"
        />
      </div>
    );
  }

  return (
    <div className="mx-5 mb-4 grid grid-cols-2 gap-2">
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
        >
          <Image
            src={src}
            alt={`게시글 이미지 ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 320px"
          />
        </div>
      ))}
    </div>
  );
}
