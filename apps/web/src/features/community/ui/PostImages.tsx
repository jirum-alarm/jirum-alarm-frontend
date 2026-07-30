'use client';

import Image from 'next/image';

// ponytail: 원본 비율을 모른 채(업로드 시 width/height를 저장하지 않음) 잘림을 없애려면
// 컨테이너를 고정 비율로 두지 않는 수밖에 없다. 단일 이미지는 max-height 안에서 비율대로
// 흐르게 하고(object-contain), 여러 장은 정사각 그리드를 유지하되 contain 으로 전체를 보여준다.
// 업로드 시 이미지 크기를 함께 저장하게 되면 aspect-ratio 를 실제 값으로 지정해 CLS 를 없앨 수 있다.
export default function PostImages({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="mx-5 mb-4 flex w-fit justify-center overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={images[0]}
          alt="게시글 이미지"
          width={1200}
          height={1200}
          className="h-auto max-h-[70vh] w-auto max-w-full object-contain"
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
            className="object-contain"
            sizes="(max-width: 768px) 50vw, 320px"
          />
        </div>
      ))}
    </div>
  );
}
