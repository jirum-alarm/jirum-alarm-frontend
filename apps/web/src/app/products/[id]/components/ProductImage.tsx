'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IProduct } from '@/graphql/interface';
import { IllustStanding } from '@/components/common/icons';

const convertToWebp = (url?: string) => {
  return url?.replace(/\.[^.]+$/, '.webp');
};

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
      <div className="relative h-[375px] w-full smd:h-[550px]">
        <Image
          src={imageSrc}
          alt={product.title}
          unoptimized
          fill
          onError={handleError}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
});
