'use client';

import Image from 'next/image';
import React, { useState } from 'react';

import { IllustStanding } from '@/components/common/icons';
import { convertToWebp } from '../../../../util/image';

export default React.memo(function ProductImage({
  product,
}: {
  product: { thumbnail?: string | null; title: string };
}) {
  const thumbnail = product.thumbnail ?? undefined;
  const [imageSrc, setImageSrc] = useState<string | undefined>(convertToWebp(thumbnail));
  const [isError, setIsError] = useState<boolean>(false);

  const handleError = () => {
    if (!imageSrc || imageSrc.endsWith('.webp')) {
      setImageSrc(thumbnail);
    } else {
      setIsError(true);
    }
  };

  if (!product.thumbnail || !imageSrc || isError) {
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
          rel="preload"
          src={imageSrc}
          alt={product.title}
          fill
          loading="eager"
          decoding="async"
          priority={true}
          onError={handleError}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
});
