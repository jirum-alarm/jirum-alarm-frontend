'use client';

import Image from 'next/image';

import { convertToWebp } from '@/shared/lib/utils/image';

// ponytail: 원본 비율을 모른 채(업로드 시 width/height를 저장하지 않음) 잘림을 없애려면
// 컨테이너를 고정 비율로 두지 않는 수밖에 없다. 단일 이미지는 max-height 안에서 비율대로
// 흐르게 하고(object-contain), 여러 장은 정사각 그리드를 유지하되 contain 으로 전체를 보여준다.
// 업로드 시 이미지 크기를 함께 저장하게 되면 aspect-ratio 를 실제 값으로 지정해 CLS 를 없앨 수 있다.
export default function PostImages({ images: rawImages }: { images: string[] }) {
  // ★CDN 은 webp 만 갖고 있고 본문 마커는 원본 확장자(.jpg/.png)를 준다 →
  // 그대로 쓰면 403 이라 첨부가 통째로 안 보인다. 상품 썸네일은 이미
  // `ProductThumbnail` 이 convertToWebp 를 태우는데 여기만 빠져 있었다.
  // 실측(2026-09-09): 최근 글의 cdn URL 26/29 가 403, 같은 경로의 .webp 는 200.
  // `/_next/image?url=…jpg` 도 403 → 웹에서도 안 보이던 상태다.
  const images = rawImages.map((src) => convertToWebp(src) ?? src);

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
