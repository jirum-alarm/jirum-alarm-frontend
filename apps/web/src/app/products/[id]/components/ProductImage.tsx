'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IProduct } from '@/graphql/interface';
import { IllustStanding } from '@/components/common/icons';

export default React.memo(function ProductImage({
  product,
}: {
  product: { thumbnail?: string | null; title: string };
}) {
  const [error, setError] = useState(false);

  return (
    <div className="sticky top-11">
      {!error && product.thumbnail ? (
        <div className="relative h-[375px] w-full smd:h-[550px]">
          <Image
            src={product.thumbnail}
            alt={product.title ?? ''}
            onError={() => setError(true)}
            priority
            unoptimized
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      ) : (
        <div className="flex h-[248px] w-full items-center justify-center">
          <div className="-mt-20">
            <IllustStanding />
          </div>
        </div>
      )}
    </div>
  );
});
