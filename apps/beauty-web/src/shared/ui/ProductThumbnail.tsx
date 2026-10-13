'use client';

import Image from 'next/image';
import { useState } from 'react';

import { convertToWebp } from '@/shared/lib/format';
import { CosmeticsIcon } from '@/shared/ui/icons';

/**
 * 원격 썸네일용 단색 placeholder(카드 배경 gray-50 과 같은 색) — web shared/config/image-placeholder.ts 와 같은 값.
 * opacity 페이드로 바꾸지 말 것: 크롬이 opacity:0 페인트를 LCP 후보에서 뺀다.
 */
const REMOTE_IMAGE_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNmOWZhZmIiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=';

/**
 * 상품 썸네일 — web entities/product-list/ui/card/ProductThumbnail 의 동작을 줄여 옮겼다.
 * webp 변환본 → 실패하면 원본 → 그래도 실패하면 화장품 아이콘. 부모는 relative + aspect-square.
 */
export default function ProductThumbnail({
  src,
  alt,
  sizes,
  priority,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const webp = convertToWebp(src);
  const [current, setCurrent] = useState(webp ?? src ?? '');
  const [failed, setFailed] = useState(false);

  if (!current || failed) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <CosmeticsIcon className="size-16" />
      </div>
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      // Next 16 의 priority 는 fetchpriority 를 안 붙인다 — LCP 후보는 명시(web 과 같음).
      fetchPriority={priority ? 'high' : undefined}
      placeholder={REMOTE_IMAGE_PLACEHOLDER}
      className="object-cover"
      onError={() => {
        if (src && current !== src) setCurrent(src);
        else setFailed(true);
      }}
    />
  );
}
