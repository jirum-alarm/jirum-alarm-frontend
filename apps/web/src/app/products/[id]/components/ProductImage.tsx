import Image from 'next/image';
import React from 'react';

import { IllustStanding } from '@/components/common/icons';
import { convertToWebp } from '../../../../util/image';

export default function ProductImage({
  product,
}: {
  product: { thumbnail?: string | null; title: string };
}) {
  const thumbnail = product.thumbnail ?? undefined;
  const imageSrc = convertToWebp(thumbnail);

  if (!product.thumbnail || !imageSrc) {
    return (
      <div className="flex h-[248px] w-full items-center justify-center">
        <div className="-mt-20">
          <IllustStanding />
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-11">
      <div
        className="relative aspect-[4/3] w-full"
        style={{
          contain: 'layout paint',
          contentVisibility: 'auto',
        }}
      >
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          priority={true}
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={90}
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
            '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/></svg>',
          ).toString('base64')}`}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
}
